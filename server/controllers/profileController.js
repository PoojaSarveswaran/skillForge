const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { validateProfileInput, isPositiveInt } = require('../utils/validators');
const { toPublicUser } = require('./authController');
const { logActivity } = require('../services/activityService');

const getProfile = asyncHandler(async (req, res) => {
  const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  res.json({ user: toPublicUser(user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { display_name, education_stage, weekly_availability_hours, career_goals, target_role_id } = req.body;
  validateProfileInput(req.body);

  if (target_role_id !== undefined && target_role_id !== null) {
    if (!isPositiveInt(target_role_id)) {
      return res.status(400).json({ error: 'target_role_id must be a positive integer.', fields: { target_role_id: 'Invalid role id.' } });
    }
    const [[role]] = await db.query('SELECT id FROM career_roles WHERE id = ?', [target_role_id]);
    if (!role) {
      return res.status(404).json({ error: 'Selected career role does not exist.' });
    }
  }

  const updates = [];
  const params = [];
  if (display_name !== undefined) { updates.push('display_name = ?'); params.push(display_name.trim()); }
  if (education_stage !== undefined) { updates.push('education_stage = ?'); params.push(education_stage); }
  if (weekly_availability_hours !== undefined) { updates.push('weekly_availability_hours = ?'); params.push(weekly_availability_hours); }
  if (career_goals !== undefined) { updates.push('career_goals = ?'); params.push(career_goals); }
  if (target_role_id !== undefined) { updates.push('target_role_id = ?'); params.push(target_role_id); }

  if (updates.length > 0) {
    params.push(req.user.id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  if (target_role_id !== undefined) {
    await logActivity(req.user.id, 'role_selected', `Selected a new target career role.`);
  }

  const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  res.json({ user: toPublicUser(user) });
});

// Resets all learning data for the current user (skills, roadmaps, activity)
// while keeping the account itself. Destructive — requires explicit client
// confirmation before this is ever called.
const resetData = asyncHandler(async (req, res) => {
  await db.query('DELETE FROM user_skills WHERE user_id = ?', [req.user.id]);
  await db.query('DELETE FROM roadmaps WHERE user_id = ?', [req.user.id]); // cascades to roadmap_items
  await db.query('DELETE FROM activity_logs WHERE user_id = ?', [req.user.id]);
  await db.query('UPDATE users SET target_role_id = NULL WHERE id = ?', [req.user.id]);

  const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  res.json({ user: toPublicUser(user) });
});

module.exports = { getProfile, updateProfile, resetData };
