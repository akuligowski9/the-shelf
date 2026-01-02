require('dotenv').config();

const express = require('express');
const cors = require('cors');

const entriesRouter = require('./routes/entries');
const habitsRouter = require('./routes/habits');
const targetsRouter = require('./routes/targets');
const settingsRouter = require('./routes/settings');
const programsRouter = require('./routes/programs');
const reflectionsRouter = require('./routes/reflections');
const preparationsRouter = require('./routes/preparations');
const dashboardRouter = require('./routes/dashboard');
const metricsRouter = require('./routes/metrics');

const app = express();

app.use(cors());
app.use(express.json());

// health
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// core routes
app.use('/entries', entriesRouter);
app.use('/habits', habitsRouter);
app.use('/targets', targetsRouter);

// new routes
app.use('/settings', settingsRouter);
app.use('/programs', programsRouter);
app.use('/reflections', reflectionsRouter);
app.use('/preparations', preparationsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/metrics', metricsRouter);

// basic error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: err.message || 'Internal error' });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Shelf API listening on http://localhost:${port}`);
});
