const { IMPORTANCE_WEIGHTS, HOURS_PER_PROFICIENCY_LEVEL } = require('./constants');

function priorityFromGap({ importance, gap }) {
  const weight = IMPORTANCE_WEIGHTS[importance] || IMPORTANCE_WEIGHTS.medium;
  if (weight >= 3 && gap >= 2) return 'high';
  if (weight >= 2 || gap >= 2) return 'medium';
  return 'low';
}

/**
 * Builds an ordered roadmap plan from a skill-gap analysis.
 *
 * Only skills with gap > 0 (not yet meeting the role's target) are planned.
 * Ordering uses Kahn's topological sort over each skill's
 * `prerequisite_skill_name` (when that prerequisite is itself part of the
 * plan), so foundational skills always precede the skills that depend on
 * them. Ties are broken by a priority score combining importance weight and
 * gap size (bigger, more important gaps come first among unblocked skills).
 *
 * @param {Array} skillAnalysis - output of analyzeSkillGaps()
 * @returns {Array} ordered plan items: { skill_name, category, priority,
 *   estimated_hours, prerequisite_skill_name, order_index }
 */
function buildRoadmapPlan(skillAnalysis) {
  const gapsToPlan = skillAnalysis.filter((s) => s.gap > 0);
  const planBySkill = new Map(gapsToPlan.map((s) => [s.skill_name, s]));

  const priorityScore = (s) => (IMPORTANCE_WEIGHTS[s.importance] || IMPORTANCE_WEIGHTS.medium) * 10 + s.gap;

  const inDegree = new Map();
  const dependents = new Map();

  for (const skill of gapsToPlan) {
    inDegree.set(skill.skill_name, 0);
    dependents.set(skill.skill_name, []);
  }

  for (const skill of gapsToPlan) {
    const prereq = skill.prerequisite_skill_name;
    if (prereq && planBySkill.has(prereq)) {
      inDegree.set(skill.skill_name, inDegree.get(skill.skill_name) + 1);
      dependents.get(prereq).push(skill.skill_name);
    }
  }

  const available = gapsToPlan.filter((s) => inDegree.get(s.skill_name) === 0);
  const ordered = [];
  const remaining = new Set(gapsToPlan.map((s) => s.skill_name));

  while (available.length > 0) {
    available.sort((a, b) => priorityScore(b) - priorityScore(a));
    const next = available.shift();
    if (!remaining.has(next.skill_name)) continue;

    ordered.push(next);
    remaining.delete(next.skill_name);

    for (const dependentName of dependents.get(next.skill_name)) {
      inDegree.set(dependentName, inDegree.get(dependentName) - 1);
      if (inDegree.get(dependentName) === 0) {
        available.push(planBySkill.get(dependentName));
      }
    }
  }

  // Defensive fallback: any skill left out due to an unexpected cycle is
  // still appended (sorted by priority) so no gap is silently dropped.
  for (const name of remaining) {
    ordered.push(planBySkill.get(name));
  }

  return ordered.map((skill, index) => ({
    skill_name: skill.skill_name,
    category: skill.category,
    title: skill.current_proficiency === 0 ? `Learn ${skill.skill_name}` : `Improve ${skill.skill_name}`,
    description: `Close the gap from level ${skill.current_proficiency} to level ${skill.target_proficiency} in ${skill.skill_name}.`,
    priority: priorityFromGap(skill),
    estimated_hours: skill.gap * HOURS_PER_PROFICIENCY_LEVEL,
    prerequisite_skill_name: skill.prerequisite_skill_name && planBySkill.has(skill.prerequisite_skill_name)
      ? skill.prerequisite_skill_name
      : null,
    order_index: index,
  }));
}

/**
 * Given the full set of items in a roadmap and a proposed new ordering
 * (array of item ids in the desired order), returns true only if every
 * item's prerequisite (if any, and if present in this roadmap) appears
 * before it in the new order.
 */
function isValidReorder(items, newOrderIds) {
  const positionById = new Map(newOrderIds.map((id, idx) => [id, idx]));
  for (const item of items) {
    if (!positionById.has(item.id)) return false;
    if (item.prerequisite_item_id && positionById.has(item.prerequisite_item_id)) {
      if (positionById.get(item.prerequisite_item_id) >= positionById.get(item.id)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * An item can only move to 'completed' if its prerequisite (when set) is
 * already completed, unless the caller explicitly overrides the dependency.
 */
function canCompleteItem(item, prerequisiteItem, { override = false } = {}) {
  if (override) return true;
  if (!item.prerequisite_item_id) return true;
  return Boolean(prerequisiteItem && prerequisiteItem.status === 'completed');
}

module.exports = {
  buildRoadmapPlan,
  isValidReorder,
  canCompleteItem,
  priorityFromGap,
};
