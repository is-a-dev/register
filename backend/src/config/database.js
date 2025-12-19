const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => console.error('🚨 DB Error:', err));

module.exports = pool;
