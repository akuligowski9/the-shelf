require('dotenv').config();

const app = require('./app');
const cron = require('node-cron');
const { execSync } = require('child_process');
const path = require('path');

const port = Number(process.env.PORT || 3001);

// Schedule nightly backup at 11:59 PM
cron.schedule('59 23 * * *', () => {
  console.log('Running scheduled backup...');
  try {
    execSync('node backup.js', {
      cwd: __dirname,
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('Scheduled backup failed:', err.message);
  }
});

app.listen(port, () => {
  console.log(`Shelf API listening on http://localhost:${port}`);
  console.log('Nightly backup scheduled for 11:59 PM');
});
