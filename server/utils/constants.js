// Proficiency scale used across the whole app (self-assessed, 0-4).
const PROFICIENCY_LABELS = {
  0: 'Not learned',
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Proficient',
};

const MIN_PROFICIENCY = 0;
const MAX_PROFICIENCY = 4;

// Relative weight of each importance tier in the readiness score formula.
const IMPORTANCE_WEIGHTS = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const IMPORTANCE_LEVELS = ['low', 'medium', 'high', 'critical'];
const PRIORITY_LEVELS = ['low', 'medium', 'high'];
const ITEM_STATUSES = ['todo', 'in_progress', 'completed'];
const ITEM_TYPES = ['milestone', 'task'];
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

// Baseline hours of study assumed per one proficiency level gained.
// Documented limitation: this is a flat estimate, not personalized to the
// user's actual learning speed.
const HOURS_PER_PROFICIENCY_LEVEL = 12;

module.exports = {
  PROFICIENCY_LABELS,
  MIN_PROFICIENCY,
  MAX_PROFICIENCY,
  IMPORTANCE_WEIGHTS,
  IMPORTANCE_LEVELS,
  PRIORITY_LEVELS,
  ITEM_STATUSES,
  ITEM_TYPES,
  DIFFICULTY_LEVELS,
  HOURS_PER_PROFICIENCY_LEVEL,
};
