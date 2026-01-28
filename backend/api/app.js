const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const pool = require('./db/pool');

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

// Log all mutating requests for data recovery (when LOG_MUTATIONS=true)
if (process.env.LOG_MUTATIONS === 'true') {
  app.use((req, res, next) => {
    const started = Date.now();
    res.on('finish', () => {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const duration = Date.now() - started;
        // Write to database for persistent storage
        pool.query(
          `INSERT INTO mutation_logs (method, path, status, duration_ms, body)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.method, req.originalUrl, res.statusCode, duration, JSON.stringify(req.body)]
        ).catch(err => {
          // Log to console as fallback if DB write fails
          console.error('Failed to log mutation:', err.message);
        });
      }
    });
    next();
  });
}

// health - no auth needed
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// version - no auth needed
const packageJson = require('./package.json');
app.get('/version', (_req, res) => {
  res.json({ version: packageJson.version });
});

// backup status - no auth needed (public GitHub data)
app.get('/backup-status', async (_req, res) => {
  try {
    const response = await fetch(
      'https://api.github.com/repos/akuligowski9/the-shelf/actions/workflows/nightly-backup.yml/runs?per_page=1',
      { headers: { 'User-Agent': 'the-shelf-api' } }
    );

    if (!response.ok) {
      return res.json({ ok: true, status: 'unknown', message: 'Could not fetch backup status' });
    }

    const data = await response.json();
    const latestRun = data.workflow_runs?.[0];

    if (!latestRun) {
      return res.json({ ok: true, status: 'none', message: 'No backups yet' });
    }

    res.json({
      ok: true,
      status: latestRun.conclusion || latestRun.status, // 'success', 'failure', 'in_progress', etc.
      run_id: latestRun.id,
      created_at: latestRun.created_at,
      html_url: latestRun.html_url,
      actions_url: 'https://github.com/akuligowski9/the-shelf/actions/workflows/nightly-backup.yml'
    });
  } catch (err) {
    res.json({ ok: true, status: 'unknown', message: err.message });
  }
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
