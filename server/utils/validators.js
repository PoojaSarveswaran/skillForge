const { MIN_PROFICIENCY, MAX_PROFICIENCY, IMPORTANCE_LEVELS, PRIORITY_LEVELS, ITEM_STATUSES, ITEM_TYPES } = require('./constants');

class ValidationError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.fields = fields;
  }
}

function isNonEmptyString(value, maxLength = 255) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && value.trim().length <= 190;
}

function isValidProficiency(value) {
  return Number.isInteger(value) && value >= MIN_PROFICIENCY && value <= MAX_PROFICIENCY;
}

function validateSkillInput({ skill_name, category, proficiency }, { requireAll = true } = {}) {
  const fields = {};

  if (requireAll || skill_name !== undefined) {
    if (!isNonEmptyString(skill_name, 100)) {
      fields.skill_name = 'Skill name is required and must be 1-100 characters.';
    }
  }
  if (category !== undefined && category !== null && category !== '' && !isNonEmptyString(category, 60)) {
    fields.category = 'Category must be 1-60 characters.';
  }
  if (requireAll || proficiency !== undefined) {
    if (!isValidProficiency(proficiency)) {
      fields.proficiency = 'Proficiency must be an integer between 0 and 4.';
    }
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Invalid skill data.', fields);
  }
}

function validateRoadmapItemInput(body) {
  const fields = {};
  const { title, priority, estimated_hours, status, item_type, order_index } = body;

  if (title !== undefined && !isNonEmptyString(title, 160)) {
    fields.title = 'Title must be 1-160 characters.';
  }
  if (priority !== undefined && !PRIORITY_LEVELS.includes(priority)) {
    fields.priority = `Priority must be one of: ${PRIORITY_LEVELS.join(', ')}.`;
  }
  if (estimated_hours !== undefined && (!Number.isInteger(estimated_hours) || estimated_hours < 0 || estimated_hours > 1000)) {
    fields.estimated_hours = 'Estimated hours must be an integer between 0 and 1000.';
  }
  if (status !== undefined && !ITEM_STATUSES.includes(status)) {
    fields.status = `Status must be one of: ${ITEM_STATUSES.join(', ')}.`;
  }
  if (item_type !== undefined && !ITEM_TYPES.includes(item_type)) {
    fields.item_type = `Item type must be one of: ${ITEM_TYPES.join(', ')}.`;
  }
  if (order_index !== undefined && (!Number.isInteger(order_index) || order_index < 0)) {
    fields.order_index = 'Order index must be a non-negative integer.';
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Invalid roadmap item data.', fields);
  }
}

function validateProfileInput(body) {
  const fields = {};
  const { display_name, education_stage, weekly_availability_hours, career_goals } = body;

  if (display_name !== undefined && !isNonEmptyString(display_name, 120)) {
    fields.display_name = 'Display name must be 1-120 characters.';
  }
  if (education_stage !== undefined && education_stage !== null && education_stage !== '' && !isNonEmptyString(education_stage, 160)) {
    fields.education_stage = 'Education stage must be at most 160 characters.';
  }
  if (weekly_availability_hours !== undefined) {
    if (!Number.isInteger(weekly_availability_hours) || weekly_availability_hours < 0 || weekly_availability_hours > 168) {
      fields.weekly_availability_hours = 'Weekly availability must be an integer between 0 and 168.';
    }
  }
  if (career_goals !== undefined && career_goals !== null && typeof career_goals === 'string' && career_goals.length > 2000) {
    fields.career_goals = 'Career goals must be at most 2000 characters.';
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Invalid profile data.', fields);
  }
}

function isPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

module.exports = {
  ValidationError,
  isNonEmptyString,
  isValidEmail,
  isValidProficiency,
  isPositiveInt,
  validateSkillInput,
  validateRoadmapItemInput,
  validateProfileInput,
};
