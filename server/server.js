require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    const conn = await db.getConnection();
    conn.release();
    console.log('Database connection established.');
  } catch (err) {
    console.error('Failed to connect to the database on startup:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`SkillForge API listening on http://localhost:${PORT}`);
  });
}

start();
