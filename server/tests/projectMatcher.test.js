const { recommendProjects } = require('../utils/projectMatcher');

const skillAnalysis = [
  { skill_name: 'Python', status: 'critical' },
  { skill_name: 'Machine Learning', status: 'critical' },
  { skill_name: 'Statistics', status: 'needs_improvement' },
  { skill_name: 'SQL', status: 'meets_requirement' },
  { skill_name: 'Excel', status: 'exceeds_requirement' },
];

const projects = [
  {
    id: 1,
    title: 'Classification Model',
    skills: [
      { skill_name: 'Python', is_prerequisite: true },
      { skill_name: 'Machine Learning', is_prerequisite: false },
      { skill_name: 'Statistics', is_prerequisite: false },
    ],
  },
  {
    id: 2,
    title: 'Spreadsheet Report',
    skills: [
      { skill_name: 'Excel', is_prerequisite: false },
      { skill_name: 'SQL', is_prerequisite: false },
    ],
  },
  {
    id: 3,
    title: 'Unrelated Project',
    skills: [{ skill_name: 'Welding', is_prerequisite: false }],
  },
];

describe('recommendProjects', () => {
  test('ranks projects covering critical gaps above projects with no gap overlap', () => {
    const ranked = recommendProjects(projects, skillAnalysis);
    expect(ranked[0].title).toBe('Classification Model');
  });

  test('computes match_score as percentage of practiced skills that are gaps', () => {
    const ranked = recommendProjects(projects, skillAnalysis);
    const classification = ranked.find((p) => p.title === 'Classification Model');
    // 2 of 2 non-prerequisite skills (Machine Learning, Statistics) are gaps
    expect(classification.match_score).toBe(100);
  });

  test('a project with only met/exceeded skills scores 0', () => {
    const ranked = recommendProjects(projects, skillAnalysis);
    const spreadsheet = ranked.find((p) => p.title === 'Spreadsheet Report');
    expect(spreadsheet.match_score).toBe(0);
  });

  test('a project with no skill overlap at all scores 0 and has no critical hits', () => {
    const ranked = recommendProjects(projects, skillAnalysis);
    const unrelated = ranked.find((p) => p.title === 'Unrelated Project');
    expect(unrelated.match_score).toBe(0);
    expect(unrelated.critical_hits).toBe(0);
  });

  test('prerequisites_met is false when the user has no proficiency in a prerequisite skill', () => {
    const ranked = recommendProjects(projects, skillAnalysis, new Map());
    const classification = ranked.find((p) => p.title === 'Classification Model');
    expect(classification.prerequisites_met).toBe(false);
  });

  test('prerequisites_met is true when the user has at least beginner proficiency', () => {
    const ranked = recommendProjects(projects, skillAnalysis, new Map([['python', 2]]));
    const classification = ranked.find((p) => p.title === 'Classification Model');
    expect(classification.prerequisites_met).toBe(true);
  });
});
