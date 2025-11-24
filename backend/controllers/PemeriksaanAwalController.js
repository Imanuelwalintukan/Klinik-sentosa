// Controller untuk modul pemeriksaan awal oleh perawat
const pemeriksaanAwalModel = require('../models/PemeriksaanAwal');
const db = require('../config/database');

const getAllPemeriksaanAwal = async (req, res) => {
  try {
    const pemeriksaans = await pemeriksaanAwalModel.getAllPemeriksaanAwal();
    res.json({
      success: true,
      data: pemeriksaans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPemeriksaanAwalById = async (req, res) => {
  try {
    const { id } = req.params;
    const pemeriksaan = await pemeriksaanAwalModel.getPemeriksaanAwalById(id);

    if (!pemeriksaan) {
      return res.status(404).json({
        success: false,
        message: 'Pemeriksaan awal tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: pemeriksaan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPemeriksaanAwalByPasienId = async (req, res) => {
  try {
    const { pasienId } = req.params;
    const pemeriksaans = await pemeriksaanAwalModel.getPemeriksaanAwalByPasienId(pasienId);

    res.json({
      success: true,
      data: pemeriksaans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getLatestPemeriksaanAwalByPasienId = async (req, res) => {
  try {
    const { pasienId } = req.params;

    // Validasi parameter
    if (!pasienId || isNaN(pasienId)) {
      return res.status(400).json({
        success: false,
        message: 'ID pasien tidak valid'
      });
    }

    const result = await db.query(`
      SELECT
        pa.*,
        p.nama as nama_pasien,
        perawat.nama as nama_perawat
      FROM pemeriksaan_awal pa
      LEFT JOIN pasien p ON pa.id_pasien = p.id
      LEFT JOIN perawat ON pa.id_perawat = perawat.id
      WHERE pa.id_pasien = $1
      ORDER BY pa.tanggal_pemeriksaan DESC
      LIMIT 1
    `, [pasienId]);

    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching latest initial check:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createPemeriksaanAwal = async (req, res) => {
  try {
    const pemeriksaanData = req.body;

    // Validasi data yang diperlukan
    if (!pemeriksaanData.id_pasien || !pemeriksaanData.id_perawat) {
      return res.status(400).json({
        success: false,
        message: 'ID pasien dan ID perawat wajib diisi'
      });
    }

    // Validasi bahwa pasien dan perawat benar-benar ada
    const pasienCheck = await db.query('SELECT id FROM pasien WHERE id = $1', [pemeriksaanData.id_pasien]);
    if (pasienCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }

    const perawatCheck = await db.query('SELECT id FROM perawat WHERE id = $1', [pemeriksaanData.id_perawat]);
    if (perawatCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Perawat tidak ditemukan'
      });
    }

    const newPemeriksaan = await pemeriksaanAwalModel.createPemeriksaanAwal(pemeriksaanData);

    res.status(201).json({
      success: true,
      data: newPemeriksaan
    });
  } catch (error) {
    console.error('Error creating initial check:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updatePemeriksaanAwal = async (req, res) => {
  try {
    const { id } = req.params;
    const pemeriksaanData = req.body;
    const updatedPemeriksaan = await pemeriksaanAwalModel.updatePemeriksaanAwal(id, pemeriksaanData);

    res.json({
      success: true,
      data: updatedPemeriksaan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deletePemeriksaanAwal = async (req, res) => {
  try {
    const { id } = req.params;
    await pemeriksaanAwalModel.deletePemeriksaanAwal(id);

    res.json({
      success: true,
      message: 'Pemeriksaan awal berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllPemeriksaanAwal,
  getPemeriksaanAwalById,
  getPemeriksaanAwalByPasienId,
  getLatestPemeriksaanAwalByPasienId,
  createPemeriksaanAwal,
  updatePemeriksaanAwal,
  deletePemeriksaanAwal
};