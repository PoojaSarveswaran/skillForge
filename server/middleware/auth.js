const jwt = require('jsonwebtoken');

/**
 * Demo-grade JWT auth. Not intended as a production-hardened auth system —
 * no refresh tokens, rate limiting, or email verification. Good enough to
 * scope all skill/roadmap/profile data to a single signed-in user.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

module.exports = { requireAuth };
