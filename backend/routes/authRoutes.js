const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi untuk generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token berlaku selama 1 hari
  });
};

// Staff Login Endpoint
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'Username tidak ditemukan.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password salah.' });
    }

    // Login berhasil, buat token dan kirim data pengguna
    const token = generateToken(user.id, user.role);
    const userData = {
      id: user.id,
      username: user.username,
      name: user.nama,
      role: user.role,
      spesialis: user.spesialis,
    };

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: { ...userData, token }, // Kirim token bersama data pengguna
    });

  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    });
  }
});


// Pasien Login Endpoint
// POST /api/auth/login/pasien
router.post('/login/pasien', async (req, res) => {
  const { nomor_telepon, nomor_bpjs } = req.body;

  if (!nomor_telepon && !nomor_bpjs) {
    return res.status(400).json({
      success: false,
      message: 'Nomor telepon atau nomor BPJS wajib diisi.'
    });
  }

  try {
    let queryText = 'SELECT * FROM pasien WHERE ';
    const queryParams = [];

    if (nomor_telepon) {
      queryText += 'nomor_telepon = $1';
      queryParams.push(nomor_telepon);
    } else if (nomor_bpjs) {
      queryText += 'nomor_bpjs = $1';
      queryParams.push(nomor_bpjs);
    }

    const result = await db.query(queryText, queryParams);
    const pasien = result.rows[0];

    if (!pasien) {
      return res.status(404).json({
        success: false,
        message: 'Login gagal. Data pasien tidak ditemukan.'
      });
    }

    // Jika ditemukan, buat token dan kirim data pasien
    const token = generateToken(pasien.id, 'pasien');
    const userData = {
      id: pasien.id,
      username: pasien.nomor_telepon,
      name: pasien.nama,
      role: 'pasien',
      nomor_telepon: pasien.nomor_telepon,
      alamat: pasien.alamat,
      tanggal_lahir: pasien.tanggal_lahir,
      jenis_kelamin: pasien.jenis_kelamin
    };

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: { ...userData, token } // Kirim token bersama data pengguna
    });

  } catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
    });
  }
});

module.exports = router;
