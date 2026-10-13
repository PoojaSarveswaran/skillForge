const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { isPositiveInt, validateRoadmapItemInput, ValidationError } = require('../utils/validators');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');
const roadmapService = require('../services/roadmapService');
const { isValidReorder, canCompleteItem } = require('../utils/roadmapPlanner');
const { logActivity } = require('../services/activityService');

const listRoadmaps = asyncHandler(async (req, res) => {
  const [roadmaps] = await db.query(
    `SELECT r.*, cr.title AS role_title, cr.slug AS role_slug
     FROM roadmaps r JOIN career_roles cr ON cr.id = r.role_id
     WHERE r.user_id = ? ORDER BY r.status = 'active' DESC, r.created_at DESC`,
    [req.user.id]
  );
  res.json({ roadmaps });
});

const createRoadmap = asyncHandler(async (req, res) => {
  const { role_id, regenerate } = req.body;
  if (!isPositiveInt(role_id)) {
    throw new ValidationError('A valid role_id is required.', { role_id: 'Must be a positive integer.' });
  }

  const roadmap = await roadmapService.generateRoadmap(req.user.id, role_id, { regenerate: Boolean(regenerate) });
  await logActivity(req.user.id, 'roadmap_generated', `Generated a learning roadmap: "${roadmap.title}".`);
  res.status(201).json({ roadmap });
});

async function loadOwnedRoadmap(roadmapId, userId) {
  const [[roadmap]] = await db.query('SELECT * FROM roadmaps WHERE id = ? AND user_id = ?', [roadmapId, userId]);
  if (!roadmap) throw new NotFoundError('Roadmap not found.');
  return roadmap;
}

const updateRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isPositiveInt(id)) throw new NotFoundError('Roadmap not found.');
  await loadOwnedRoadmap(id, req.user.id);

  const { title, status } = req.body;
  const updates = [];
  const params = [];
  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (status !== undefined) {
    if (!['active', 'archived'].includes(status)) {
      throw new ValidationError('Invalid roadmap status.', { status: 'Must be active or archived.' });
    }
    updates.push('status = ?');
    params.push(status);
  }

  if (updates.length > 0) {
    params.push(id);
    await db.query(`UPDATE roadmaps SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  const [[roadmap]] = await db.query('SELECT * FROM roadmaps WHERE id = ?', [id]);
  res.json({ roadmap });
});

const getRoadmapItemsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isPositiveInt(id)) throw new NotFoundError('Roadmap not found.');
  await loadOwnedRoadmap(id, req.user.id);

  const items = await roadmapService.getRoadmapItems(id);
  const progress = roadmapService.computeProgress(items);
  res.json({ items, progress });
});

const addRoadmapItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isPositiveInt(id)) throw new NotFoundError('Roadmap not found.');
  await loadOwnedRoadmap(id, req.user.id);

  const { title, description, priority = 'medium', estimated_hours = 5, skill_name } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 160) {
    throw new ValidationError('Title is required (1-160 characters).', { title: 'Required.' });
  }
  validateRoadmapItemInput({ title, priority, estimated_hours });

  const [[{ maxOrder }]] = await db.query(
    'SELECT COALESCE(MAX(order_index), -1) AS maxOrder FROM roadmap_items WHERE roadmap_id = ?',
    [id]
  );

  const [result] = await db.query(
    `INSERT INTO roadmap_items (roadmap_id, title, item_type, skill_name, description, priority, estimated_hours, order_index)
     VALUES (?, ?, 'task', ?, ?, ?, ?, ?)`,
    [id, title.trim(), skill_name || null, description || null, priority, estimated_hours, maxOrder + 1]
  );

  const [[item]] = await db.query('SELECT * FROM roadmap_items WHERE id = ?', [result.insertId]);
  await logActivity(req.user.id, 'task_added', `Added personal task "${item.title}" to roadmap.`);
  res.status(201).json({ item });
});

const reorderRoadmapItems = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isPositiveInt(id)) throw new NotFoundError('Roadmap not found.');
  await loadOwnedRoadmap(id, req.user.id);

  const { order } = req.body;
  if (!Array.isArray(order) || order.some((v) => !isPositiveInt(v))) {
    throw new ValidationError('order must be an array of item ids.', { order: 'Invalid.' });
  }

  const items = await roadmapService.getRoadmapItems(id);
  const orderIds = order.map(Number);

  if (orderIds.length !== items.length || !items.every((i) => orderIds.includes(i.id))) {
    throw new ValidationError('order must include every item in this roadmap exactly once.', {});
  }

  if (!isValidReorder(items, orderIds)) {
    throw new ConflictError('This order violates a prerequisite relationship — a skill cannot be scheduled before its prerequisite.');
  }

  await Promise.all(
    orderIds.map((itemId, index) =>
      db.query('UPDATE roadmap_items SET order_index = ? WHERE id = ? AND roadmap_id = ?', [index, itemId, id])
    )
  );

  const updated = await roadmapService.getRoadmapItems(id);
  res.json({ items: updated });
});

const updateRoadmapItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  if (!isPositiveInt(itemId)) throw new NotFoundError('Roadmap item not found.');

  const [[item]] = await db.query(
    `SELECT ri.* FROM roadmap_items ri
     JOIN roadmaps r ON r.id = ri.roadmap_id
     WHERE ri.id = ? AND r.user_id = ?`,
    [itemId, req.user.id]
  );
  if (!item) throw new NotFoundError('Roadmap item not found.');

  const { title, description, priority, estimated_hours, status, override_prerequisite } = req.body;
  validateRoadmapItemInput(req.body);

  if (status === 'completed' && item.status !== 'completed') {
    let prerequisiteItem = null;
    if (item.prerequisite_item_id) {
      const [[row]] = await db.query('SELECT * FROM roadmap_items WHERE id = ?', [item.prerequisite_item_id]);
      prerequisiteItem = row || null;
    }
    if (!canCompleteItem(item, prerequisiteItem, { override: Boolean(override_prerequisite) })) {
      throw new ConflictError(
        `Cannot mark "${item.title}" complete until its prerequisite "${prerequisiteItem ? prerequisiteItem.title : 'unknown'}" is completed. Set override_prerequisite to true to bypass this intentionally.`
      );
    }
    if (override_prerequisite) {
      await db.query('UPDATE roadmap_items SET prerequisite_item_id = NULL WHERE id = ?', [itemId]);
    }
  }

  const updates = [];
  const params = [];
  if (title !== undefined) { updates.push('title = ?'); params.push(title.trim()); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
  if (estimated_hours !== undefined) { updates.push('estimated_hours = ?'); params.push(estimated_hours); }
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
    updates.push('completed_at = ?');
    params.push(status === 'completed' ? new Date() : null);
  }

  if (updates.length > 0) {
    params.push(itemId);
    await db.query(`UPDATE roadmap_items SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  const [[updatedItem]] = await db.query('SELECT * FROM roadmap_items WHERE id = ?', [itemId]);

  if (status === 'completed' && item.status !== 'completed') {
    await logActivity(req.user.id, 'milestone_completed', `Completed "${updatedItem.title}".`);
  }

  res.json({ item: updatedItem });
});

const deleteRoadmapItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  if (!isPositiveInt(itemId)) throw new NotFoundError('Roadmap item not found.');

  const [[item]] = await db.query(
    `SELECT ri.* FROM roadmap_items ri
     JOIN roadmaps r ON r.id = ri.roadmap_id
     WHERE ri.id = ? AND r.user_id = ?`,
    [itemId, req.user.id]
  );
  if (!item) throw new NotFoundError('Roadmap item not found.');
  if (item.item_type !== 'task') {
    throw new ConflictError('Only personal tasks can be deleted. Milestones generated from skill gaps cannot be removed directly.');
  }

  await db.query('DELETE FROM roadmap_items WHERE id = ?', [itemId]);
  res.status(204).end();
});

module.exports = {
  listRoadmaps,
  createRoadmap,
  updateRoadmap,
  getRoadmapItemsHandler,
  addRoadmapItem,
  reorderRoadmapItems,
  updateRoadmapItem,
  deleteRoadmapItem,
};
