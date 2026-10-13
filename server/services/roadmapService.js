const db = require('../config/db');
const { analyzeSkillGaps } = require('../utils/skillGap');
const { buildRoadmapPlan } = require('../utils/roadmapPlanner');
const { NotFoundError } = require('../middleware/errorHandler');

async function getRoleOrThrow(roleId) {
  const [[role]] = await db.query('SELECT * FROM career_roles WHERE id = ?', [roleId]);
  if (!role) throw new NotFoundError('Career role not found.');
  return role;
}

/**
 * Generates (or returns the existing active) roadmap for a user+role pair.
 * Creates one roadmap_item per skill gap, ordered by buildRoadmapPlan's
 * topological/priority sort, and wires up prerequisite_item_id by mapping
 * each plan step's prerequisite skill name back to the row just inserted
 * for it.
 */
async function generateRoadmap(userId, roleId, { regenerate = false } = {}) {
  const role = await getRoleOrThrow(roleId);

  const [existing] = await db.query(
    'SELECT * FROM roadmaps WHERE user_id = ? AND role_id = ? AND status = "active"',
    [userId, roleId]
  );

  if (existing.length > 0 && !regenerate) {
    return existing[0];
  }

  if (existing.length > 0 && regenerate) {
    await db.query('UPDATE roadmaps SET status = "archived" WHERE id = ?', [existing[0].id]);
  }

  const [roleSkills] = await db.query(
    'SELECT skill_name, category, target_proficiency, importance, prerequisite_skill_name FROM role_skills WHERE role_id = ?',
    [roleId]
  );
  const [userSkills] = await db.query(
    'SELECT skill_name, proficiency FROM user_skills WHERE user_id = ?',
    [userId]
  );

  const skillAnalysis = analyzeSkillGaps(roleSkills, userSkills);
  const plan = buildRoadmapPlan(skillAnalysis);

  const [roadmapResult] = await db.query(
    'INSERT INTO roadmaps (user_id, role_id, title, status) VALUES (?, ?, ?, "active")',
    [userId, roleId, `${role.title} Roadmap`]
  );
  const roadmapId = roadmapResult.insertId;

  const skillNameToItemId = new Map();

  for (const step of plan) {
    const prerequisiteItemId = step.prerequisite_skill_name
      ? skillNameToItemId.get(step.prerequisite_skill_name) || null
      : null;

    const [itemResult] = await db.query(
      `INSERT INTO roadmap_items
         (roadmap_id, title, item_type, skill_name, description, priority, estimated_hours, order_index, prerequisite_item_id)
       VALUES (?, ?, 'milestone', ?, ?, ?, ?, ?, ?)`,
      [
        roadmapId,
        step.title,
        step.skill_name,
        step.description,
        step.priority,
        step.estimated_hours,
        step.order_index,
        prerequisiteItemId,
      ]
    );
    skillNameToItemId.set(step.skill_name, itemResult.insertId);
  }

  const [[roadmap]] = await db.query('SELECT * FROM roadmaps WHERE id = ?', [roadmapId]);
  return roadmap;
}

async function getRoadmapItems(roadmapId) {
  const [items] = await db.query(
    'SELECT * FROM roadmap_items WHERE roadmap_id = ? ORDER BY order_index ASC, id ASC',
    [roadmapId]
  );
  return items;
}

function computeProgress(items) {
  const total = items.length;
  const completed = items.filter((i) => i.status === 'completed').length;
  const inProgress = items.filter((i) => i.status === 'in_progress').length;
  const totalHours = items.reduce((sum, i) => sum + i.estimated_hours, 0);
  const completedHours = items.filter((i) => i.status === 'completed').reduce((sum, i) => sum + i.estimated_hours, 0);

  return {
    total_items: total,
    completed_items: completed,
    in_progress_items: inProgress,
    todo_items: total - completed - inProgress,
    completion_percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    total_estimated_hours: totalHours,
    completed_estimated_hours: completedHours,
  };
}

module.exports = { generateRoadmap, getRoadmapItems, computeProgress, getRoleOrThrow };
