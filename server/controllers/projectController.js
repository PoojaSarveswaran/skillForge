const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { isPositiveInt } = require('../utils/validators');
const { NotFoundError } = require('../middleware/errorHandler');
const { analyzeSkillGaps } = require('../utils/skillGap');
const { recommendProjects } = require('../utils/projectMatcher');

async function attachSkills(projects) {
  if (projects.length === 0) return projects;
  const [skillRows] = await db.query(
    `SELECT project_id, skill_name, is_prerequisite FROM project_skills WHERE project_id IN (?)`,
    [projects.map((p) => p.id)]
  );
  const skillsByProject = new Map();
  for (const row of skillRows) {
    if (!skillsByProject.has(row.project_id)) skillsByProject.set(row.project_id, []);
    skillsByProject.get(row.project_id).push({ skill_name: row.skill_name, is_prerequisite: !!row.is_prerequisite });
  }
  return projects.map((p) => ({
    ...p,
    deliverables: typeof p.deliverables === 'string' ? JSON.parse(p.deliverables) : p.deliverables,
    skills: skillsByProject.get(p.id) || [],
  }));
}

const listProjects = asyncHandler(async (req, res) => {
  const { difficulty, search } = req.query;
  let sql = 'SELECT * FROM projects WHERE 1=1';
  const params = [];
  if (difficulty && difficulty !== 'All') {
    sql += ' AND difficulty = ?';
    params.push(difficulty);
  }
  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY difficulty ASC, title ASC';

  const [projects] = await db.query(sql, params);
  const withSkills = await attachSkills(projects);
  res.json({ projects: withSkills });
});

const recommendedProjects = asyncHandler(async (req, res) => {
  const { roleId } = req.params;
  if (!isPositiveInt(roleId)) throw new NotFoundError('Career role not found.');

  const [[role]] = await db.query('SELECT id FROM career_roles WHERE id = ?', [roleId]);
  if (!role) throw new NotFoundError('Career role not found.');

  const [roleSkills] = await db.query(
    'SELECT skill_name, category, target_proficiency, importance, prerequisite_skill_name FROM role_skills WHERE role_id = ?',
    [roleId]
  );
  const [userSkills] = await db.query('SELECT skill_name, proficiency FROM user_skills WHERE user_id = ?', [req.user.id]);
  const skillAnalysis = analyzeSkillGaps(roleSkills, userSkills);

  const [allProjects] = await db.query('SELECT * FROM projects');
  const withSkills = await attachSkills(allProjects);

  const userProficiencyByName = new Map(userSkills.map((s) => [s.skill_name.trim().toLowerCase(), s.proficiency]));
  const recommended = recommendProjects(withSkills, skillAnalysis, userProficiencyByName).filter((p) => p.match_score > 0);

  res.json({ projects: recommended });
});

module.exports = { listProjects, recommendedProjects };
