// Controller untuk rekam medis elektronik (EMR)
const emrModel = require('../models/EMRModel');
const db = require('../config/database');

// Mendapatkan semua rekam medis untuk pasien tertentu
const getRekamMedisByPasienId = async (req, res) => {
  try {
    const { id_pasien } = req.params;
    const rekamMedis = await emrModel.getRekamMedisByPasienId(id_pasien);

    res.json({
      success: true,
      data: rekamMedis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan rekam medis spesifik berdasarkan ID
const getRekamMedisById = async (req, res) => {
  try {
    const { id } = req.params;
    const rekamMedis = await emrModel.getRekamMedisById(id);

    if (!rekamMedis) {
      return res.status(404).json({
        success: false,
        message: 'Rekam medis tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: rekamMedis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Membuat rekam medis baru
const createRekamMedis = async (req, res) => {
  try {
    const rekamMedisData = req.body;
    const newRekamMedis = await emrModel.createRekamMedis(rekamMedisData);

    res.status(201).json({
      success: true,
      data: newRekamMedis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Memperbarui rekam medis
const updateRekamMedis = async (req, res) => {
  try {
    const { id } = req.params;
    const rekamMedisData = req.body;
    const updatedRekamMedis = await emrModel.updateRekamMedis(id, rekamMedisData);

    res.json({
      success: true,
      data: updatedRekamMedis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan riwayat alergi pasien
const getRiwayatAlergiByPasienId = async (req, res) => {
  try {
    const { id_pasien } = req.params;
    const riwayatAlergi = await emrModel.getRiwayatAlergiByPasienId(id_pasien);

    res.json({
      success: true,
      data: riwayatAlergi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Membuat riwayat alergi baru
const createRiwayatAlergi = async (req, res) => {
  try {
    const alergiData = req.body;
    const newAlergi = await emrModel.createRiwayatAlergi(alergiData);

    res.status(201).json({
      success: true,
      data: newAlergi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan pemeriksaan penunjang untuk pasien
const getPemeriksaanPenunjangByPasienId = async (req, res) => {
  try {
    const { id_pasien } = req.params;
    const pemeriksaanPenunjang = await emrModel.getPemeriksaanPenunjangByPasienId(id_pasien);

    res.json({
      success: true,
      data: pemeriksaanPenunjang
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan riwayat imunisasi pasien
const getRiwayatImunisasiByPasienId = async (req, res) => {
  try {
    const { id_pasien } = req.params;
    const riwayatImunisasi = await emrModel.getRiwayatImunisasiByPasienId(id_pasien);

    res.json({
      success: true,
      data: riwayatImunisasi
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan pemeriksaan awal terbaru untuk pasien
const getLatestPemeriksaanAwalByPasienId = async (req, res) => {
  try {
    const { id_pasien } = req.params;
    const latestCheck = await emrModel.getLatestPemeriksaanAwalByPasienId(id_pasien);

    res.json({
      success: true,
      data: latestCheck
    });
  } catch (error) {
    console.error('Error getting latest initial check:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan semua pemeriksaan awal untuk pasien
const getPemeriksaanAwalByPasienId = async (req, res) => {
  try {
    const { id_pasien } = req.params;
    const checks = await emrModel.getPemeriksaanAwalByPasienId(id_pasien);

    res.json({
      success: true,
      data: checks
    });
  } catch (error) {
    console.error('Error getting all initial checks:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan riwayat pemeriksaan dokter untuk pasien
const getRiwayatPemeriksaanByPasienId = async (req, res) => {
  try {
    const { id_pasien } = req.params;
    const examinations = await emrModel.getRiwayatPemeriksaanByPasienId(id_pasien);

    res.json({
      success: true,
      data: examinations
    });
  } catch (error) {
    console.error('Error getting doctor examination history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Menggabungkan semua data EMR untuk pasien
const getAllEMRByPasienId = async (req, res) => {
  try {
    const { id_pasien } = req.params;

    // Ambil semua data EMR untuk pasien dalam satu objek
    const [
      rekamMedisResult,
      riwayatAlergiResult,
      pemeriksaanPenunjangResult,
      riwayatImunisasiResult
    ] = await Promise.allSettled([
      emrModel.getRekamMedisByPasienId(id_pasien),
      emrModel.getRiwayatAlergiByPasienId(id_pasien),
      emrModel.getPemeriksaanPenunjangByPasienId(id_pasien),
      emrModel.getRiwayatImunisasiByPasienId(id_pasien)
    ]);

    // Kita juga ambil pemeriksaan dokter terpisah
    const dokterExams = await emrModel.getRiwayatPemeriksaanByPasienId(id_pasien);

    const emrData = {
      rekam_medis: rekamMedisResult.status === 'fulfilled' ? rekamMedisResult.value : [],
      riwayat_alergi: riwayatAlergiResult.status === 'fulfilled' ? riwayatAlergiResult.value : [],
      pemeriksaan_penunjang: pemeriksaanPenunjangResult.status === 'fulfilled' ? pemeriksaanPenunjangResult.value : [],
      riwayat_imunisasi: riwayatImunisasiResult.status === 'fulfilled' ? riwayatImunisasiResult.value : [],
      pemeriksaan_dokter: dokterExams
    };

    res.json({
      success: true,
      data: emrData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getRekamMedisByPasienId,
  getRekamMedisById,
  createRekamMedis,
  updateRekamMedis,
  getRiwayatAlergiByPasienId,
  createRiwayatAlergi,
  getPemeriksaanPenunjangByPasienId,
  getRiwayatImunisasiByPasienId,
  getLatestPemeriksaanAwalByPasienId,
  getPemeriksaanAwalByPasienId,
  getRiwayatPemeriksaanByPasienId,
  getAllEMRByPasienId
};