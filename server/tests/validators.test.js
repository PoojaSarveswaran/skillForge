const { isValidProficiency, isValidEmail, validateSkillInput, ValidationError } = require('../utils/validators');

describe('isValidProficiency', () => {
  test.each([0, 1, 2, 3, 4])('accepts %i as a valid proficiency', (v) => {
    expect(isValidProficiency(v)).toBe(true);
  });

  test.each([-1, 5, 1.5, NaN, '2', null, undefined])('rejects %p as invalid', (v) => {
    expect(isValidProficiency(v)).toBe(false);
  });
});

describe('isValidEmail', () => {
  test('accepts a well-formed email', () => {
    expect(isValidEmail('demo@skillforge.ai')).toBe(true);
  });

  test.each(['not-an-email', 'missing@domain', '@nodomain.com', ''])('rejects %p', (v) => {
    expect(isValidEmail(v)).toBe(false);
  });
});

describe('validateSkillInput', () => {
  test('passes for a complete, valid skill', () => {
    expect(() => validateSkillInput({ skill_name: 'Python', category: 'AI/ML', proficiency: 2 })).not.toThrow();
  });

  test('throws ValidationError for an out-of-range proficiency', () => {
    expect(() => validateSkillInput({ skill_name: 'Python', category: 'AI/ML', proficiency: 9 })).toThrow(ValidationError);
  });

  test('throws ValidationError for an empty skill name', () => {
    expect(() => validateSkillInput({ skill_name: '  ', category: 'AI/ML', proficiency: 2 })).toThrow(ValidationError);
  });

  test('allows partial input when requireAll is false', () => {
    expect(() => validateSkillInput({ proficiency: 3 }, { requireAll: false })).not.toThrow();
  });
});
