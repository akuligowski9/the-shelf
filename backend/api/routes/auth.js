const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');

const router = express.Router();

// Config from environment
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL; // Your email
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:3001';
const PORTFOLIO_URL = process.env.PORTFOLIO_URL || 'https://akuligowski-portfolio.vercel.app/';

// Cookie settings - detect production by checking if not localhost
const isProduction = !API_URL.includes('localhost');
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Configure Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${API_URL}/auth/google/callback`,
  }, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value;
    done(null, {
      id: profile.id,
      email,
      name: profile.displayName,
      provider: 'google'
    });
  }));
}

// Configure GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${API_URL}/auth/github/callback`,
    scope: ['user:email'],
  }, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value;
    done(null, {
      id: profile.id,
      email,
      name: profile.displayName || profile.username,
      provider: 'github'
    });
  }));
}

// Helper to create JWT
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, provider: user.provider },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Helper to check if user is allowed
function isAllowedUser(email) {
  if (!ALLOWED_EMAIL) return true; // No restriction if not set
  return email?.toLowerCase() === ALLOWED_EMAIL.toLowerCase();
}

// OAuth callback handler
function handleOAuthCallback(req, res) {
  const user = req.user;

  if (!isAllowedUser(user.email)) {
    // Redirect unauthorized users to portfolio contact page
    return res.redirect(PORTFOLIO_URL);
  }

  const token = createToken(user);
  res.cookie('auth_token', token, COOKIE_OPTIONS);
  res.redirect(`${FRONTEND_URL}`);
}

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=failed`, session: false }),
  handleOAuthCallback
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', {
  scope: ['user:email'],
  session: false
}));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/login?error=failed`, session: false }),
  handleOAuthCallback
);

// Get current user
router.get('/me', (req, res) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.json({ ok: true, user: null, authenticated: false });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return res.json({ ok: true, user, authenticated: true });
  } catch (err) {
    return res.json({ ok: true, user: null, authenticated: false });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', COOKIE_OPTIONS);
  res.json({ ok: true, message: 'Logged out' });
});

// Auth status for demo mode
router.get('/status', (req, res) => {
  const token = req.cookies?.auth_token;
  const isDemoMode = process.env.DEMO_MODE === 'true';

  let authenticated = false;
  let user = null;

  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
      authenticated = true;
    } catch (err) {
      // Invalid token
    }
  }

  res.json({
    ok: true,
    authenticated,
    user: authenticated ? { name: user.name, email: user.email } : null,
    demo_mode: isDemoMode,
    read_only: isDemoMode && !authenticated,
  });
});

module.exports = router;
