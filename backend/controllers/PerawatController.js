// Controller untuk modul perawat
const perawatModel = require('../models/PerawatModel');

// Mendapatkan semua perawat
const getAllPerawat = async (req, res) => {
  try {
    const perawats = await perawatModel.getAllPerawat();
    res.json({
      success: true,
      data: perawats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan perawat berdasarkan ID
const getPerawatById = async (req, res) => {
  try {
    const { id } = req.params;
    const perawat = await perawatModel.getPerawatById(id);

    if (!perawat) {
      return res.status(404).json({
        success: false,
        message: 'Perawat tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: perawat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Membuat perawat baru
const createPerawat = async (req, res) => {
  try {
    const perawatData = req.body;
    const newPerawat = await perawatModel.createPerawat(perawatData);

    res.status(201).json({
      success: true,
      data: newPerawat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Memperbarui data perawat
const updatePerawat = async (req, res) => {
  try {
    const { id } = req.params;
    const perawatData = req.body;
    const updatedPerawat = await perawatModel.updatePerawat(id, perawatData);

    res.json({
      success: true,
      data: updatedPerawat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Menghapus perawat
const deletePerawat = async (req, res) => {
  try {
    const { id } = req.params;
    await perawatModel.deletePerawat(id);

    res.json({
      success: true,
      message: 'Perawat berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan semua pemeriksaan awal
const getAllPemeriksaanAwal = async (req, res) => {
  try {
    const pemeriksaans = await perawatModel.getAllPemeriksaanAwal();
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

// Mendapatkan pemeriksaan awal berdasarkan ID
const getPemeriksaanAwalById = async (req, res) => {
  try {
    const { id } = req.params;
    const pemeriksaan = await perawatModel.getPemeriksaanAwalById(id);

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

// Mendapatkan pemeriksaan awal berdasarkan ID pasien
const getPemeriksaanAwalByPasienId = async (req, res) => {
  try {
    const { pasienId } = req.params;
    const pemeriksaans = await perawatModel.getPemeriksaanAwalByPasienId(pasienId);

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

// Mendapatkan pemeriksaan awal terbaru berdasarkan ID pasien
const getLatestPemeriksaanAwalByPasienId = async (req, res) => {
  try {
    const { pasienId } = req.params;
    const latestCheck = await perawatModel.getLatestPemeriksaanAwalByPasienId(pasienId);

    res.json({
      success: true,
      data: latestCheck
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Membuat pemeriksaan awal baru
const createPemeriksaanAwal = async (req, res) => {
  try {
    const pemeriksaanData = req.body;
    const newPemeriksaan = await perawatModel.createPemeriksaanAwal(pemeriksaanData);

    res.status(201).json({
      success: true,
      data: newPemeriksaan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Memperbarui data pemeriksaan awal
const updatePemeriksaanAwal = async (req, res) => {
  try {
    const { id } = req.params;
    const pemeriksaanData = req.body;
    const updatedPemeriksaan = await perawatModel.updatePemeriksaanAwal(id, pemeriksaanData);

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

// Menghapus pemeriksaan awal
const deletePemeriksaanAwal = async (req, res) => {
  try {
    const { id } = req.params;
    await perawatModel.deletePemeriksaanAwal(id);

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
  getAllPerawat,
  getPerawatById,
  createPerawat,
  updatePerawat,
  deletePerawat,
  getAllPemeriksaanAwal,
  getPemeriksaanAwalById,
  getPemeriksaanAwalByPasienId,
  getLatestPemeriksaanAwalByPasienId,
  createPemeriksaanAwal,
  updatePemeriksaanAwal,
  deletePemeriksaanAwal
};