const { buildRoadmapPlan, isValidReorder, canCompleteItem } = require('../utils/roadmapPlanner');

function skill(name, { gap, importance = 'medium', prereq = null, current = 0, target = null }) {
  return {
    skill_name: name,
    category: 'Test',
    importance,
    current_proficiency: current,
    target_proficiency: target ?? current + gap,
    gap,
    status: gap > 0 ? 'needs_improvement' : 'meets_requirement',
    prerequisite_skill_name: prereq,
  };
}

describe('buildRoadmapPlan', () => {
  test('excludes skills with no gap', () => {
    const plan = buildRoadmapPlan([skill('A', { gap: 0 }), skill('B', { gap: 2 })]);
    expect(plan.map((p) => p.skill_name)).toEqual(['B']);
  });

  test('orders a prerequisite strictly before its dependent', () => {
    const plan = buildRoadmapPlan([
      skill('Machine Learning', { gap: 3, importance: 'critical', prereq: 'Statistics' }),
      skill('Statistics', { gap: 2, importance: 'high' }),
    ]);
    const stats = plan.findIndex((p) => p.skill_name === 'Statistics');
    const ml = plan.findIndex((p) => p.skill_name === 'Machine Learning');
    expect(stats).toBeLessThan(ml);
  });

  test('ignores a prerequisite that is not itself part of the plan (already satisfied)', () => {
    const plan = buildRoadmapPlan([
      skill('React', { gap: 2, importance: 'critical', prereq: 'JavaScript' }), // JavaScript not in gap list
    ]);
    expect(plan[0].prerequisite_skill_name).toBeNull();
  });

  test('breaks ties among unblocked skills by importance weight then gap size', () => {
    const plan = buildRoadmapPlan([
      skill('LowPriority', { gap: 1, importance: 'low' }),
      skill('HighPriority', { gap: 3, importance: 'critical' }),
    ]);
    expect(plan[0].skill_name).toBe('HighPriority');
  });

  test('assigns sequential order_index starting at 0', () => {
    const plan = buildRoadmapPlan([skill('A', { gap: 1 }), skill('B', { gap: 2 })]);
    expect(plan.map((p) => p.order_index)).toEqual([0, 1]);
  });

  test('estimated_hours scales with gap size', () => {
    const plan = buildRoadmapPlan([skill('A', { gap: 2 })]);
    expect(plan[0].estimated_hours).toBe(2 * 12);
  });

  test('handles a chain of three dependent skills in correct order', () => {
    const plan = buildRoadmapPlan([
      skill('Deep Learning', { gap: 3, importance: 'medium', prereq: 'Machine Learning' }),
      skill('Machine Learning', { gap: 3, importance: 'critical', prereq: 'Statistics' }),
      skill('Statistics', { gap: 2, importance: 'high' }),
    ]);
    expect(plan.map((p) => p.skill_name)).toEqual(['Statistics', 'Machine Learning', 'Deep Learning']);
  });
});

describe('isValidReorder', () => {
  test('rejects an order placing a dependent before its prerequisite', () => {
    const items = [
      { id: 1, prerequisite_item_id: null },
      { id: 2, prerequisite_item_id: 1 },
    ];
    expect(isValidReorder(items, [2, 1])).toBe(false);
  });

  test('accepts an order respecting prerequisites', () => {
    const items = [
      { id: 1, prerequisite_item_id: null },
      { id: 2, prerequisite_item_id: 1 },
    ];
    expect(isValidReorder(items, [1, 2])).toBe(true);
  });

  test('is indifferent to ordering among items with no dependency relation', () => {
    const items = [
      { id: 1, prerequisite_item_id: null },
      { id: 2, prerequisite_item_id: null },
    ];
    expect(isValidReorder(items, [2, 1])).toBe(true);
  });
});

describe('canCompleteItem', () => {
  test('allows completion when there is no prerequisite', () => {
    expect(canCompleteItem({ prerequisite_item_id: null }, null)).toBe(true);
  });

  test('blocks completion when prerequisite is incomplete', () => {
    const item = { prerequisite_item_id: 5 };
    const prereq = { id: 5, status: 'in_progress' };
    expect(canCompleteItem(item, prereq)).toBe(false);
  });

  test('allows completion when prerequisite is completed', () => {
    const item = { prerequisite_item_id: 5 };
    const prereq = { id: 5, status: 'completed' };
    expect(canCompleteItem(item, prereq)).toBe(true);
  });

  test('allows completion when override is explicitly set, even if prerequisite is incomplete', () => {
    const item = { prerequisite_item_id: 5 };
    const prereq = { id: 5, status: 'todo' };
    expect(canCompleteItem(item, prereq, { override: true })).toBe(true);
  });
});
