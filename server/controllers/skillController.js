const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { validateSkillInput, isPositiveInt } = require('../utils/validators');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { logActivity } = require('../services/activityService');

const listSkills = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM user_skills WHERE user_id = ?';
  const params = [req.user.id];

  if (category && category !== 'All') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND skill_name LIKE ?';
    params.push(`%${search}%`);
  }
  sql += ' ORDER BY category ASC, skill_name ASC';

  const [skills] = await db.query(sql, params);
  res.json({ skills });
});

const createSkill = asyncHandler(async (req, res) => {
  const { skill_name, category, proficiency } = req.body;
  validateSkillInput({ skill_name, category, proficiency });

  const [existing] = await db.query(
    'SELECT id FROM user_skills WHERE user_id = ? AND skill_name = ?',
    [req.user.id, skill_name.trim()]
  );
  if (existing.length > 0) {
    throw new ConflictError(`You already have a skill named "${skill_name.trim()}". Edit it instead.`);
  }

  const [result] = await db.query(
    'INSERT INTO user_skills (user_id, skill_name, category, proficiency) VALUES (?, ?, ?, ?)',
    [req.user.id, skill_name.trim(), (category || 'General').trim(), proficiency]
  );
  const [[skill]] = await db.query('SELECT * FROM user_skills WHERE id = ?', [result.insertId]);

  await logActivity(req.user.id, 'skill_added', `Added skill "${skill.skill_name}" at level ${proficiency}.`);
  res.status(201).json({ skill });
});

const updateSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isPositiveInt(id)) throw new NotFoundError('Skill not found.');

  const [[existing]] = await db.query('SELECT * FROM user_skills WHERE id = ? AND user_id = ?', [id, req.user.id]);
  if (!existing) throw new NotFoundError('Skill not found.');

  const { skill_name, category, proficiency } = req.body;
  validateSkillInput({ skill_name, category, proficiency }, { requireAll: false });

  const updates = [];
  const params = [];
  if (skill_name !== undefined) { updates.push('skill_name = ?'); params.push(skill_name.trim()); }
  if (category !== undefined) { updates.push('category = ?'); params.push(category.trim()); }
  if (proficiency !== undefined) { updates.push('proficiency = ?'); params.push(proficiency); }

  if (updates.length > 0) {
    params.push(id, req.user.id);
    await db.query(`UPDATE user_skills SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);
  }

  const [[skill]] = await db.query('SELECT * FROM user_skills WHERE id = ?', [id]);
  if (proficiency !== undefined) {
    await logActivity(req.user.id, 'skill_updated', `Updated "${skill.skill_name}" to level ${proficiency}.`);
  }
  res.json({ skill });
});

const deleteSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isPositiveInt(id)) throw new NotFoundError('Skill not found.');

  const [[existing]] = await db.query('SELECT * FROM user_skills WHERE id = ? AND user_id = ?', [id, req.user.id]);
  if (!existing) throw new NotFoundError('Skill not found.');

  await db.query('DELETE FROM user_skills WHERE id = ? AND user_id = ?', [id, req.user.id]);
  await logActivity(req.user.id, 'skill_removed', `Removed skill "${existing.skill_name}".`);
  res.status(204).end();
});

module.exports = { listSkills, createSkill, updateSkill, deleteSkill };
