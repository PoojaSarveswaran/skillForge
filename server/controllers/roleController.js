const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { isPositiveInt } = require('../utils/validators');
const { NotFoundError } = require('../middleware/errorHandler');

function parseJsonColumns(role) {
  return {
    ...role,
    key_responsibilities: typeof role.key_responsibilities === 'string' ? JSON.parse(role.key_responsibilities) : role.key_responsibilities,
    learning_sequence: typeof role.learning_sequence === 'string' ? JSON.parse(role.learning_sequence) : role.learning_sequence,
  };
}

const listRoles = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM career_roles WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (title LIKE ? OR short_description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY title ASC';

  const [roles] = await db.query(sql, params);
  const [skillCounts] = await db.query(
    'SELECT role_id, COUNT(*) AS skill_count FROM role_skills GROUP BY role_id'
  );
  const countByRole = new Map(skillCounts.map((r) => [r.role_id, r.skill_count]));

  res.json({
    roles: roles.map((r) => ({ ...parseJsonColumns(r), skill_count: countByRole.get(r.id) || 0 })),
  });
});

const getRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isPositiveInt(id)) throw new NotFoundError('Career role not found.');

  const [[role]] = await db.query('SELECT * FROM career_roles WHERE id = ?', [id]);
  if (!role) throw new NotFoundError('Career role not found.');

  const [skills] = await db.query(
    'SELECT skill_name, category, target_proficiency, importance, prerequisite_skill_name FROM role_skills WHERE role_id = ? ORDER BY importance DESC, skill_name ASC',
    [id]
  );
  const [projects] = await db.query(
    `SELECT DISTINCT p.id, p.slug, p.title, p.difficulty, p.estimated_hours
     FROM projects p
     JOIN project_skills ps ON ps.project_id = p.id
     WHERE ps.skill_name IN (?) AND ps.is_prerequisite = FALSE
     LIMIT 6`,
    [skills.length ? skills.map((s) => s.skill_name) : ['__none__']]
  );

  res.json({ role: { ...parseJsonColumns(role), skills, example_projects: projects } });
});

const listCategories = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT DISTINCT category FROM career_roles ORDER BY category ASC');
  res.json({ categories: rows.map((r) => r.category) });
});

module.exports = { listRoles, getRole, listCategories };
