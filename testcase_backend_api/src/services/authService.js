const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');
const { BadRequestError, UnauthorizedError } = require('../middleware/errorHandler');

async function getUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, email, password_hash, display_name, is_active
     FROM users
     WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function getUserRoles(userId) {
  const { rows } = await pool.query(
    `SELECT r.name
     FROM user_roles ur
     JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = $1`,
    [userId]
  );
  return rows.map((r) => r.name);
}

function signJwt({ userId, email, roles }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new BadRequestError('Server misconfiguration: JWT_SECRET is not set');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  return jwt.sign(
    {
      email,
      roles,
    },
    secret,
    {
      subject: userId,
      expiresIn,
    }
  );
}

/**
 * PUBLIC_INTERFACE
 * Register a new user. By default, assigns role "QA" unless role is provided and caller is Admin elsewhere.
 */
async function register({ email, password, displayName, roleName }) {
  const existing = await getUserByEmail(email);
  if (existing) throw new BadRequestError('Email already in use');

  const passwordHash = await bcrypt.hash(password, 10);

  const userInsert = await pool.query(
    `INSERT INTO users (email, password_hash, display_name, is_active)
     VALUES ($1, $2, $3, true)
     RETURNING id, email, display_name`,
    [email, passwordHash, displayName || null]
  );
  const user = userInsert.rows[0];

  const roleToAssign = roleName || 'QA';
  const roleRow = await pool.query('SELECT id FROM roles WHERE name = $1', [roleToAssign]);
  if (!roleRow.rows[0]) throw new BadRequestError(`Unknown role: ${roleToAssign}`);

  await pool.query(
    `INSERT INTO user_roles (user_id, role_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, role_id) DO NOTHING`,
    [user.id, roleRow.rows[0].id]
  );

  const roles = await getUserRoles(user.id);
  const token = signJwt({ userId: user.id, email: user.email, roles });
  return { user: { id: user.id, email: user.email, displayName: user.display_name, roles }, token };
}

/**
 * PUBLIC_INTERFACE
 * Login with email/password and return JWT + user profile.
 */
async function login({ email, password }) {
  const user = await getUserByEmail(email);
  if (!user || !user.is_active) throw new UnauthorizedError('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new UnauthorizedError('Invalid credentials');

  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

  const roles = await getUserRoles(user.id);
  const token = signJwt({ userId: user.id, email: user.email, roles });

  return {
    user: { id: user.id, email: user.email, displayName: user.display_name, roles },
    token,
  };
}

/**
 * PUBLIC_INTERFACE
 * Return current user profile using req.user.sub.
 */
async function getMe(userId) {
  const { rows } = await pool.query(
    `SELECT id, email, display_name, is_active, last_login_at, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );
  if (!rows[0]) throw new UnauthorizedError('User not found');

  const roles = await getUserRoles(userId);
  return { ...rows[0], roles };
}

module.exports = {
  register,
  login,
  getMe,
};
