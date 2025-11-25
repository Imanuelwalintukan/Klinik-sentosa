// Script untuk membuat admin default
const bcrypt = require('bcryptjs');
const db = require('./backend/config/database');

const createAdminUser = async () => {
  try {
    console.log('Membuat akun admin default...');

    const username = 'admin';
    const nama = 'Administrator';
    const password = 'admin123'; // Ganti dengan password yang lebih kuat di produksi
    const role = 'admin';
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Cek apakah admin sudah ada
    const existingAdmin = await db.query('SELECT id FROM users WHERE username = $1 AND role = $2', [username, role]);

    if (existingAdmin.rows.length > 0) {
      console.log('Akun admin sudah ada di sistem');
      return;
    }

    // Buat user admin
    await db.query(`
      INSERT INTO users (username, password_hash, role, nama) 
      VALUES ($1, $2, $3, $4)
    `, [username, passwordHash, role, nama]);

    console.log('Akun admin berhasil dibuat!');
    console.log('Username:', username);
    console.log('Password:', password);
  } catch (error) {
    console.error('Gagal membuat akun admin:', error.message);
  } finally {
    process.exit(0);
  }
};

createAdminUser();