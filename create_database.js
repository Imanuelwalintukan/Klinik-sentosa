// create_database.js - Membuat database jika belum ada
const { Client } = require('pg');
require('dotenv').config();

// Koneksi tanpa menyebut database spesifik untuk membuat database
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASS || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const createDatabase = async () => {
  try {
    await client.connect();
    console.log('Terhubung ke server PostgreSQL');

    // Membuat database jika belum ada
    const dbResult = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = 'klinik_sentosa'
    `);

    if (dbResult.rows.length === 0) {
      console.log('Membuat database klinik_sentosa...');
      await client.query('CREATE DATABASE klinik_sentosa');
      console.log('Database klinik_sentosa berhasil dibuat');
    } else {
      console.log('Database klinik_sentosa sudah ada');
    }

  } catch (err) {
    console.error('Error saat membuat database:', err.message);
  } finally {
    await client.end();
  }
};

createDatabase();