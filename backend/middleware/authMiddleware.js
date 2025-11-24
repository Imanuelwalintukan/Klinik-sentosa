const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware untuk melindungi route yang memerlukan autentikasi
const protect = async (req, res, next) => {
  let token;

  // Cek apakah ada token di header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil token dari header
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Cari user di database berdasarkan ID dari token
      // Kita perlu memeriksa beberapa tabel: users (untuk staf) dan pasien
      let userResult;
      if (decoded.role === 'pasien') {
        userResult = await db.query('SELECT id, nama, nomor_telepon as username, \'pasien\' as role FROM pasien WHERE id = $1', [decoded.id]);
      } else {
        userResult = await db.query('SELECT id, username, nama, role FROM users WHERE id = $1', [decoded.id]);
      }
      
      const user = userResult.rows[0];

      if (!user) {
        return res.status(401).json({ success: false, message: 'Tidak diizinkan, pengguna tidak ditemukan.' });
      }

      // Hapus password hash jika ada, dan tambahkan data user ke request
      delete user.password_hash;
      req.user = user;

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ success: false, message: 'Tidak diizinkan, token gagal.' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Tidak diizinkan, tidak ada token.' });
  }
};

// Middleware untuk memberikan otorisasi berdasarkan peran
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Akses ditolak. Peran '${req.user?.role}' tidak diizinkan untuk mengakses sumber daya ini.` });
    }
    next();
  };
};

module.exports = { protect, authorize };
