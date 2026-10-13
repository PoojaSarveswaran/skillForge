const { classifyGap, analyzeSkillGaps, calculateReadinessScore, summarizeByStatus } = require('../utils/skillGap');

describe('classifyGap', () => {
  test('exceeds_requirement when current is above target', () => {
    expect(classifyGap({ gap: -1, importance: 'medium' })).toBe('exceeds_requirement');
  });

  test('meets_requirement when gap is exactly zero', () => {
    expect(classifyGap({ gap: 0, importance: 'critical' })).toBe('meets_requirement');
  });

  test('critical when gap >= 2 and importance is high or critical', () => {
    expect(classifyGap({ gap: 2, importance: 'high' })).toBe('critical');
    expect(classifyGap({ gap: 3, importance: 'critical' })).toBe('critical');
  });

  test('needs_improvement when gap is small or importance is low/medium', () => {
    expect(classifyGap({ gap: 1, importance: 'critical' })).toBe('needs_improvement');
    expect(classifyGap({ gap: 3, importance: 'low' })).toBe('needs_improvement');
    expect(classifyGap({ gap: 2, importance: 'medium' })).toBe('needs_improvement');
  });
});

describe('analyzeSkillGaps', () => {
  const roleSkills = [
    { skill_name: 'Python', category: 'AI/ML', target_proficiency: 4, importance: 'critical', prerequisite_skill_name: null },
    { skill_name: 'SQL', category: 'Databases', target_proficiency: 2, importance: 'medium', prerequisite_skill_name: null },
  ];

  test('treats a missing user skill as proficiency 0', () => {
    const result = analyzeSkillGaps(roleSkills, []);
    const python = result.find((s) => s.skill_name === 'Python');
    expect(python.current_proficiency).toBe(0);
    expect(python.gap).toBe(4);
    expect(python.status).toBe('critical');
  });

  test('matches skill names case-insensitively and trims whitespace', () => {
    const result = analyzeSkillGaps(roleSkills, [{ skill_name: ' python ', proficiency: 3 }]);
    const python = result.find((s) => s.skill_name === 'Python');
    expect(python.current_proficiency).toBe(3);
    expect(python.gap).toBe(1);
  });

  test('every returned skill includes a next_action string', () => {
    const result = analyzeSkillGaps(roleSkills, []);
    for (const skill of result) {
      expect(typeof skill.next_action).toBe('string');
      expect(skill.next_action.length).toBeGreaterThan(0);
    }
  });
});

describe('calculateReadinessScore', () => {
  test('returns 0 for an empty skill set', () => {
    expect(calculateReadinessScore([]).overall_score).toBe(0);
  });

  test('returns 100 when every skill meets or exceeds target', () => {
    const analysis = analyzeSkillGaps(
      [
        { skill_name: 'A', category: 'X', target_proficiency: 2, importance: 'high', prerequisite_skill_name: null },
        { skill_name: 'B', category: 'X', target_proficiency: 3, importance: 'low', prerequisite_skill_name: null },
      ],
      [
        { skill_name: 'A', proficiency: 4 },
        { skill_name: 'B', proficiency: 3 },
      ]
    );
    expect(calculateReadinessScore(analysis).overall_score).toBe(100);
  });

  test('weights critical-importance gaps more heavily than low-importance gaps', () => {
    const criticalGapOnly = analyzeSkillGaps(
      [
        { skill_name: 'A', category: 'X', target_proficiency: 4, importance: 'critical', prerequisite_skill_name: null },
        { skill_name: 'B', category: 'X', target_proficiency: 4, importance: 'low', prerequisite_skill_name: null },
      ],
      [{ skill_name: 'B', proficiency: 4 }] // A missing (critical gap), B maxed (low importance)
    );
    const lowGapOnly = analyzeSkillGaps(
      [
        { skill_name: 'A', category: 'X', target_proficiency: 4, importance: 'critical', prerequisite_skill_name: null },
        { skill_name: 'B', category: 'X', target_proficiency: 4, importance: 'low', prerequisite_skill_name: null },
      ],
      [{ skill_name: 'A', proficiency: 4 }] // A maxed (critical), B missing (low importance gap)
    );
    expect(calculateReadinessScore(lowGapOnly).overall_score).toBeGreaterThan(
      calculateReadinessScore(criticalGapOnly).overall_score
    );
  });
});

describe('summarizeByStatus', () => {
  test('counts every bucket even when zero', () => {
    const analysis = analyzeSkillGaps(
      [{ skill_name: 'A', category: 'X', target_proficiency: 2, importance: 'medium', prerequisite_skill_name: null }],
      [{ skill_name: 'A', proficiency: 2 }]
    );
    expect(summarizeByStatus(analysis)).toEqual({
      critical: 0,
      needs_improvement: 0,
      meets_requirement: 1,
      exceeds_requirement: 0,
    });
  });
});
