const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { isPositiveInt } = require('../utils/validators');
const { NotFoundError } = require('../middleware/errorHandler');
const { analyzeSkillGaps, calculateReadinessScore, summarizeByStatus } = require('../utils/skillGap');

const getAnalysis = asyncHandler(async (req, res) => {
  const { roleId } = req.params;
  if (!isPositiveInt(roleId)) throw new NotFoundError('Career role not found.');

  const [[role]] = await db.query('SELECT id, title, slug FROM career_roles WHERE id = ?', [roleId]);
  if (!role) throw new NotFoundError('Career role not found.');

  const [roleSkills] = await db.query(
    'SELECT skill_name, category, target_proficiency, importance, prerequisite_skill_name FROM role_skills WHERE role_id = ?',
    [roleId]
  );
  const [userSkills] = await db.query(
    'SELECT skill_name, proficiency FROM user_skills WHERE user_id = ?',
    [req.user.id]
  );

  const skillAnalysis = analyzeSkillGaps(roleSkills, userSkills);
  const { overall_score } = calculateReadinessScore(skillAnalysis);
  const summary = summarizeByStatus(skillAnalysis);

  res.json({
    role: { id: role.id, title: role.title, slug: role.slug },
    overall_score,
    summary,
    skills: skillAnalysis,
    formula_explanation:
      'readiness = sum(min(current, target)/target * importance_weight) / sum(importance_weight) * 100. ' +
      'Importance weights: low=1, medium=2, high=3, critical=4. This score reflects self-assessed proficiency only and is not a guarantee of job readiness.',
  });
});

module.exports = { getAnalysis };
