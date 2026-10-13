export const PROFICIENCY_LABELS = {
  0: 'Not learned',
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Proficient',
};

export const IMPORTANCE_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const STATUS_META = {
  critical: { label: 'Critical Gap', badge: 'badge-critical', icon: '🔴' },
  needs_improvement: { label: 'Needs Improvement', badge: 'badge-warning', icon: '🟡' },
  meets_requirement: { label: 'Good Level', badge: 'badge-success', icon: '🟢' },
  exceeds_requirement: { label: 'Exceeds Requirement', badge: 'badge-info', icon: '🔵' },
};

export const PRIORITY_META = {
  high: { label: 'High', badge: 'badge-critical' },
  medium: { label: 'Medium', badge: 'badge-warning' },
  low: { label: 'Low', badge: 'badge-neutral' },
};

export const ITEM_STATUS_META = {
  todo: { label: 'To Do', badge: 'badge-neutral' },
  in_progress: { label: 'In Progress', badge: 'badge-info' },
  completed: { label: 'Completed', badge: 'badge-success' },
};

export const DIFFICULTY_META = {
  beginner: { label: 'Beginner', badge: 'badge-success' },
  intermediate: { label: 'Intermediate', badge: 'badge-warning' },
  advanced: { label: 'Advanced', badge: 'badge-critical' },
};

export const CAREER_PATHS = [
  { emoji: '💻', title: 'Full-Stack Developer' },
  { emoji: '🤖', title: 'AI/ML Engineer' },
  { emoji: '📈', title: 'Data Analyst' },
  { emoji: '🧩', title: 'Software Engineer' },
  { emoji: '🎨', title: 'Frontend Developer' },
  { emoji: '⚙️', title: 'Backend Developer' },
];
