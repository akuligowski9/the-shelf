const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const entriesRouter = require('./routes/entries');
const habitsRouter = require('./routes/habits');
const targetsRouter = require('./routes/targets');
const settingsRouter = require('./routes/settings');
const reflectionsRouter = require('./routes/reflections');
const preparationsRouter = require('./routes/preparations');
const closuresRouter = require('./routes/closures');
const dashboardRouter = require('./routes/dashboard');
const metricsRouter = require('./routes/metrics');
const transitionsRouter = require('./routes/transitions');
const dataRouter = require('./routes/data');
const demoRouter = require('./routes/demo');
const authRouter = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');

const app = express();

// CORS configuration - allow credentials for cookies
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use(express.json({ strict: false })); // strict: false allows primitive JSON values
app.use(cookieParser());
app.use(passport.initialize());

// health - no auth needed
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// auth routes - no auth needed
app.use('/auth', authRouter);

// demo routes - special auth handling (reset needs demo mode)
app.use('/demo', demoRouter);

// protected routes - require auth for writes in demo mode
app.use('/entries', requireAuth, entriesRouter);
app.use('/habits', requireAuth, habitsRouter);
app.use('/targets', requireAuth, targetsRouter);
app.use('/settings', requireAuth, settingsRouter);
app.use('/reflections', requireAuth, reflectionsRouter);
app.use('/preparations', requireAuth, preparationsRouter);
app.use('/closures', requireAuth, closuresRouter);
app.use('/dashboard', requireAuth, dashboardRouter);
app.use('/metrics', requireAuth, metricsRouter);
app.use('/transitions', requireAuth, transitionsRouter);
app.use('/data', requireAuth, dataRouter);

// basic error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: err.message || 'Internal error' });
});

module.exports = app;
