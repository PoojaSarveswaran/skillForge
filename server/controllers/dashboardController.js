const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { analyzeSkillGaps, calculateReadinessScore, summarizeByStatus } = require('../utils/skillGap');
const roadmapService = require('../services/roadmapService');
const { getRecentActivity, getWeeklyActivityCounts } = require('../services/activityService');

const getDashboard = asyncHandler(async (req, res) => {
  const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const [userSkills] = await db.query('SELECT * FROM user_skills WHERE user_id = ?', [req.user.id]);

  let readiness = null;
  let summary = null;
  let role = null;
  let roadmapProgress = null;
  let upcomingMilestones = [];

  if (user.target_role_id) {
    const [[roleRow]] = await db.query('SELECT id, title, slug FROM career_roles WHERE id = ?', [user.target_role_id]);
    role = roleRow || null;

    if (role) {
      const [roleSkills] = await db.query(
        'SELECT skill_name, category, target_proficiency, importance, prerequisite_skill_name FROM role_skills WHERE role_id = ?',
        [role.id]
      );
      const skillAnalysis = analyzeSkillGaps(roleSkills, userSkills);
      readiness = calculateReadinessScore(skillAnalysis).overall_score;
      summary = summarizeByStatus(skillAnalysis);

      const [[roadmap]] = await db.query(
        'SELECT * FROM roadmaps WHERE user_id = ? AND role_id = ? AND status = "active"',
        [req.user.id, role.id]
      );
      if (roadmap) {
        const items = await roadmapService.getRoadmapItems(roadmap.id);
        roadmapProgress = roadmapService.computeProgress(items);
        upcomingMilestones = items
          .filter((i) => i.status !== 'completed')
          .sort((a, b) => (a.priority === b.priority ? a.order_index - b.order_index : priorityRank(b.priority) - priorityRank(a.priority)))
          .slice(0, 3);
      }
    }
  }

  const recentActivity = await getRecentActivity(req.user.id, 8);
  const weeklyActivity = await getWeeklyActivityCounts(req.user.id);

  const nextAction = upcomingMilestones.length > 0
    ? `Continue with "${upcomingMilestones[0].title}" — ${upcomingMilestones[0].estimated_hours}h estimated.`
    : role
      ? 'Generate a roadmap to get a recommended next step.'
      : 'Select a target career role to begin your skill gap analysis.';

  res.json({
    readiness_score: readiness,
    total_skills_assessed: userSkills.length,
    critical_gaps: summary ? summary.critical : null,
    role,
    summary,
    roadmap_progress: roadmapProgress,
    upcoming_milestones: upcomingMilestones,
    weekly_activity: weeklyActivity,
    recent_activity: recentActivity,
    recommended_next_action: nextAction,
  });
});

function priorityRank(p) {
  return { high: 3, medium: 2, low: 1 }[p] || 0;
}

module.exports = { getDashboard };
