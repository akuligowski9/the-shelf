const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL;

/**
 * Extract token from request - checks Authorization header first, then cookie.
 * This supports both mobile (header-based) and desktop (cookie-based) auth.
 */
function extractToken(req) {
  // Check Authorization header first (mobile-friendly)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Fall back to cookie (desktop)
  return req.cookies?.auth_token;
}

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
  const token = extractToken(req);

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

  // In demo mode, allow all operations without auth (read and write)
  if (isDemoMode) {
    req.isReadOnly = false; // Demo mode allows edits
    return next();
  }

  // Block unauthenticated write operations (non-demo mode)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(401).json({
      ok: false,
      error: 'Authentication required',
      message: 'Please sign in to continue.'
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
  const token = extractToken(req);

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
