const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL;

/**
 * Middleware to require authentication for write operations.
 * In demo mode:
 *   - Unauthenticated users get read-only access (GET requests allowed)
 *   - Write operations (POST, PUT, PATCH, DELETE) require auth
 * When not in demo mode:
 *   - All requests require auth (if ALLOWED_EMAIL is set)
 */
function requireAuth(req, res, next) {
  const isDemoMode = process.env.DEMO_MODE === 'true';
  const token = req.cookies?.auth_token;

  // Try to verify token
  let user = null;
  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
      req.user = user;
    } catch (err) {
      // Invalid token, treat as unauthenticated
    }
  }

  // If user is authenticated, allow everything
  if (user) {
    return next();
  }

  // If no ALLOWED_EMAIL is set, allow everything (no auth required)
  if (!ALLOWED_EMAIL) {
    return next();
  }

  // In demo mode, allow read-only access without auth
  if (isDemoMode && req.method === 'GET') {
    req.isReadOnly = true;
    return next();
  }

  // Block unauthenticated write operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // Special case: allow demo reset even when not authenticated
    if (isDemoMode && req.path === '/reset' && req.baseUrl === '/demo') {
      return next();
    }

    return res.status(401).json({
      ok: false,
      error: 'Authentication required',
      message: isDemoMode
        ? 'This is a demo. Sign in to make changes.'
        : 'Please sign in to continue.'
    });
  }

  // Allow GET requests when not in demo mode but require auth for everything else
  if (!isDemoMode) {
    return res.status(401).json({
      ok: false,
      error: 'Authentication required',
      message: 'Please sign in to continue.'
    });
  }

  next();
}

/**
 * Optional auth - attaches user to request if authenticated, but doesn't block
 */
function optionalAuth(req, res, next) {
  const token = req.cookies?.auth_token;

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Invalid token, continue without user
    }
  }

  next();
}

module.exports = { requireAuth, optionalAuth };
