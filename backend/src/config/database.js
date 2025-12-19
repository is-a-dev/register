const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // 👈 Allow self-signed certificates
  }
});

pool.on('error', (err) => console.error('🚨 DB Error:', err));

module.exports = pool;
