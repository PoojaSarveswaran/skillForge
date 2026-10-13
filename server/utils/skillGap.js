const { IMPORTANCE_WEIGHTS } = require('./constants');

/**
 * Deterministic skill-gap analysis.
 *
 * For each skill required by a role, compares the user's current
 * self-assessed proficiency (0-4) against the role's target proficiency,
 * and classifies the gap into one of four buckets:
 *
 *   - critical            target not met, importance is high/critical, gap >= 2
 *   - needs_improvement    target not met (any other gap > 0)
 *   - meets_requirement    current proficiency exactly equals target
 *   - exceeds_requirement  current proficiency is above target
 *
 * This is intentionally simple and transparent. It is a planning aid based
 * on self-reported data, not an objective measure of employability or a
 * guarantee of job readiness.
 */
function classifyGap({ gap, importance }) {
  if (gap < 0) return 'exceeds_requirement';
  if (gap === 0) return 'meets_requirement';
  const isHighImportance = importance === 'high' || importance === 'critical';
  if (isHighImportance && gap >= 2) return 'critical';
  return 'needs_improvement';
}

function nextActionFor(status, skillName) {
  switch (status) {
    case 'critical':
      return `Start learning ${skillName} now — this is a high-impact gap.`;
    case 'needs_improvement':
      return `Practice ${skillName} to close the remaining gap.`;
    case 'meets_requirement':
      return `Maintain your current ${skillName} level with periodic practice.`;
    case 'exceeds_requirement':
      return `Consider mentoring others or exploring advanced ${skillName} topics.`;
    default:
      return `Review ${skillName}.`;
  }
}

/**
 * @param {Array} roleSkills - rows from role_skills for the selected role
 * @param {Array} userSkills - rows from user_skills for the current user
 * @returns {Array} per-skill analysis rows
 */
function analyzeSkillGaps(roleSkills, userSkills) {
  const userProficiencyByName = new Map(
    userSkills.map((s) => [s.skill_name.trim().toLowerCase(), s.proficiency])
  );

  return roleSkills.map((roleSkill) => {
    const key = roleSkill.skill_name.trim().toLowerCase();
    const current = userProficiencyByName.has(key) ? userProficiencyByName.get(key) : 0;
    const target = roleSkill.target_proficiency;
    const gap = target - current;
    const status = classifyGap({ gap, importance: roleSkill.importance });

    return {
      skill_name: roleSkill.skill_name,
      category: roleSkill.category,
      importance: roleSkill.importance,
      current_proficiency: current,
      target_proficiency: target,
      gap,
      status,
      next_action: nextActionFor(status, roleSkill.skill_name),
      prerequisite_skill_name: roleSkill.prerequisite_skill_name || null,
    };
  });
}

/**
 * Weighted readiness score (0-100).
 *
 * score = sum( min(current, target) / max(target, 1) * weight ) / sum(weight) * 100
 *
 * Skills are weighted by importance tier (critical=4 ... low=1) so that
 * falling short on a critical skill drags the score down more than falling
 * short on a low-importance one. Exceeding a target is capped at the
 * target's contribution — this is a readiness score, not an over-achievement
 * bonus.
 *
 * Limitation: this formula treats all proficiency gains as equally hard to
 * achieve (level 0→1 counts the same as 3→4), and relies entirely on
 * self-assessed proficiency.
 */
function calculateReadinessScore(skillAnalysis) {
  if (skillAnalysis.length === 0) {
    return { overall_score: 0, total_weight: 0 };
  }

  let weightedAchieved = 0;
  let totalWeight = 0;

  for (const skill of skillAnalysis) {
    const weight = IMPORTANCE_WEIGHTS[skill.importance] || IMPORTANCE_WEIGHTS.medium;
    const target = Math.max(skill.target_proficiency, 1);
    const achievedRatio = Math.min(skill.current_proficiency, skill.target_proficiency) / target;
    weightedAchieved += achievedRatio * weight;
    totalWeight += weight;
  }

  const overall_score = totalWeight > 0 ? Math.round((weightedAchieved / totalWeight) * 100) : 0;
  return { overall_score, total_weight: totalWeight };
}

function summarizeByStatus(skillAnalysis) {
  const summary = {
    critical: 0,
    needs_improvement: 0,
    meets_requirement: 0,
    exceeds_requirement: 0,
  };
  for (const skill of skillAnalysis) {
    summary[skill.status] += 1;
  }
  return summary;
}

module.exports = {
  classifyGap,
  nextActionFor,
  analyzeSkillGaps,
  calculateReadinessScore,
  summarizeByStatus,
};
