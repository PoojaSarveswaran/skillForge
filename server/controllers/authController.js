const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError, isValidEmail, isNonEmptyString } = require('../utils/validators');
const { ConflictError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    education_stage: user.education_stage,
    weekly_availability_hours: user.weekly_availability_hours,
    career_goals: user.career_goals,
    target_role_id: user.target_role_id,
    created_at: user.created_at,
  };
}

const register = asyncHandler(async (req, res) => {
  const { email, password, display_name } = req.body;
  const fields = {};

  if (!isValidEmail(email)) fields.email = 'A valid email address is required.';
  if (!isNonEmptyString(password, 200) || password.length < 8) {
    fields.password = 'Password must be at least 8 characters.';
  }
  if (!isNonEmptyString(display_name, 120)) fields.display_name = 'Display name is required.';

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Invalid registration data.', fields);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existing.length > 0) {
    throw new ConflictError('An account with that email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await db.query(
    `INSERT INTO users (email, password_hash, display_name, weekly_availability_hours)
     VALUES (?, ?, ?, ?)`,
    [normalizedEmail, passwordHash, display_name.trim(), 5]
  );

  const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  const token = signToken(user);
  res.status(201).json({ token, user: toPublicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!isValidEmail(email) || !isNonEmptyString(password, 200)) {
    throw new ValidationError('Email and password are required.', {});
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [[user]] = await db.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
});

const me = asyncHandler(async (req, res) => {
  const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(401).json({ error: 'Session user no longer exists.' });
  }
  res.json({ user: toPublicUser(user) });
});

module.exports = { register, login, me, toPublicUser };
