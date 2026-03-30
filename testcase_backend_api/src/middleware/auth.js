const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('./errorHandler');

/**
 * PUBLIC_INTERFACE
 * Middleware that verifies Bearer JWT and sets req.user = { id, email, roles }.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return next(new UnauthorizedError('Missing Bearer token'));
  }

  const token = match[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new UnauthorizedError('Server misconfiguration: JWT_SECRET is not set'));
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
    };
    return next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

/**
 * PUBLIC_INTERFACE
 * RBAC middleware that requires user to have at least one of the specified roles.
 * @param {string[]} roles
 */
function requireRoles(roles) {
  return (req, res, next) => {
    const userRoles = (req.user && req.user.roles) || [];
    const ok = roles.some((r) => userRoles.includes(r));
    if (!ok) {
      return next(new ForbiddenError('Insufficient role'));
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRoles,
};
