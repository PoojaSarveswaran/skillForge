const db = require('../config/db');

async function logActivity(userId, activityType, description, metadata = null) {
  await db.query(
    'INSERT INTO activity_logs (user_id, activity_type, description, metadata) VALUES (?, ?, ?, ?)',
    [userId, activityType, description, metadata ? JSON.stringify(metadata) : null]
  );
}

async function getRecentActivity(userId, limit = 10) {
  const [rows] = await db.query(
    'SELECT id, activity_type, description, metadata, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
}

async function getWeeklyActivityCounts(userId) {
  const [rows] = await db.query(
    `SELECT DATE(created_at) AS day, COUNT(*) AS count
     FROM activity_logs
     WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(created_at)
     ORDER BY day ASC`,
    [userId]
  );
  return rows;
}

module.exports = { logActivity, getRecentActivity, getWeeklyActivityCounts };
