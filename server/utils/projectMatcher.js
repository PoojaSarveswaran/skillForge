/**
 * Transparent, rule-based project recommendation.
 *
 * A project is recommended when the skills it lets you practice overlap
 * with your current skill gaps for the selected role. No AI model is
 * involved — this is a deterministic overlap score so the result stays
 * explainable:
 *
 *   match_score   = (practiced skills that are also gaps) / (total practiced skills) * 100
 *   critical_hits = how many of those overlapping skills are "critical" gaps
 *
 * Projects are ranked by critical_hits first, then match_score, so a
 * project that practices your most urgent gaps rises to the top even if
 * its overall overlap ratio is smaller than another project's.
 *
 * @param {Array} projects - each with { id, slug, title, ..., skills: [{skill_name, is_prerequisite}] }
 * @param {Array} skillAnalysis - output of analyzeSkillGaps()
 * @param {Map} userProficiencyByName - lowercase skill name -> proficiency (0-4)
 */
function recommendProjects(projects, skillAnalysis, userProficiencyByName = new Map()) {
  const statusByName = new Map(
    skillAnalysis.map((s) => [s.skill_name.trim().toLowerCase(), s.status])
  );
  const gapStatuses = new Set(['critical', 'needs_improvement']);

  const scored = projects.map((project) => {
    const practiced = project.skills.filter((s) => !s.is_prerequisite);
    const prerequisites = project.skills.filter((s) => s.is_prerequisite);

    const overlapping = practiced.filter((s) => {
      const status = statusByName.get(s.skill_name.trim().toLowerCase());
      return status && gapStatuses.has(status);
    });

    const criticalHits = overlapping.filter(
      (s) => statusByName.get(s.skill_name.trim().toLowerCase()) === 'critical'
    ).length;

    const matchScore = practiced.length > 0
      ? Math.round((overlapping.length / practiced.length) * 100)
      : 0;

    const prerequisitesMet = prerequisites.every((p) => {
      const proficiency = userProficiencyByName.get(p.skill_name.trim().toLowerCase()) || 0;
      return proficiency >= 1;
    });

    return {
      ...project,
      match_score: matchScore,
      critical_hits: criticalHits,
      matched_skills: overlapping.map((s) => s.skill_name),
      prerequisites_met: prerequisitesMet,
    };
  });

  return scored.sort((a, b) => b.critical_hits - a.critical_hits || b.match_score - a.match_score);
}

module.exports = { recommendProjects };
