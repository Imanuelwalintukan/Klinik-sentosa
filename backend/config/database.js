// config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Konfigurasi koneksi database
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'klinik_sentosa',
  password: process.env.DB_PASS || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Uji koneksi database
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Kesalahan koneksi database:', err.stack);
  } else {
    console.log('Terhubung ke database PostgreSQL');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool,
};