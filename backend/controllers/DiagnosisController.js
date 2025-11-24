// Controller untuk manajemen diagnosa
const diagnosisModel = require('../models/DiagnosisModel');

// Mendapatkan semua diagnosa
const getAllDiagnoses = async (req, res) => {
  try {
    const diagnoses = await diagnosisModel.getAllDiagnoses();
    res.json({
      success: true,
      data: diagnoses
    });
  } catch (error) {
    console.error('Error dalam getAllDiagnoses:', error.message);
    // Cek apakah error terkait dengan tabel tidak ada
    if (error.message && (error.message.includes('relation \"diagnosa_spesialis\" does not exist') ||
                         error.message.includes('table "diagnosa_spesialis" does not exist'))) {
      // Jika tabel tidak ada, kirimkan pesan yang lebih informatif
      res.status(500).json({
        success: false,
        message: 'Tabel diagnosa_spesialis belum dibuat. Harap jalankan seeding database terlebih dahulu.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

// Mendapatkan diagnosa berdasarkan ID
const getDiagnosisById = async (req, res) => {
  try {
    const { id } = req.params;
    const diagnosis = await diagnosisModel.getDiagnosisById(id);

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosa tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan diagnosa berdasarkan spesialisasi
const getDiagnosesBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const diagnoses = await diagnosisModel.getDiagnosesBySpecialization(specialization);

    res.json({
      success: true,
      data: diagnoses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan diagnosa berdasarkan kode
const getDiagnosisByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const diagnosis = await diagnosisModel.getDiagnosisByCode(code);

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosa tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: diagnosis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Menambahkan diagnosa baru
const createDiagnosis = async (req, res) => {
  try {
    const diagnosisData = req.body;
    const newDiagnosis = await diagnosisModel.createDiagnosis(diagnosisData);

    res.status(201).json({
      success: true,
      data: newDiagnosis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Memperbarui diagnosa
const updateDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const diagnosisData = req.body;
    const updatedDiagnosis = await diagnosisModel.updateDiagnosis(id, diagnosisData);

    res.json({
      success: true,
      data: updatedDiagnosis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Menghapus diagnosa
const deleteDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    await diagnosisModel.deleteDiagnosis(id);

    res.json({
      success: true,
      message: 'Diagnosa berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan diagnosa umum
const getGeneralDiagnoses = async (req, res) => {
  try {
    const diagnoses = await diagnosisModel.getGeneralDiagnoses();
    res.json({
      success: true,
      data: diagnoses
    });
  } catch (error) {
    console.error('Error dalam getGeneralDiagnoses:', error.message);
    // Cek apakah error terkait dengan tabel tidak ada
    if (error.message && (error.message.includes('relation \"diagnosa_spesialis\" does not exist') ||
                         error.message.includes('table "diagnosa_spesialis" does not exist'))) {
      // Jika tabel tidak ada, kirimkan pesan yang lebih informatif
      res.status(500).json({
        success: false,
        message: 'Tabel diagnosa_spesialis belum dibuat. Harap jalankan seeding database terlebih dahulu.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

// Mendapatkan diagnosa yang sering digunakan oleh dokter tertentu
const getFrequentDiagnosesForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const frequentDiagnoses = await diagnosisModel.getFrequentDiagnosesForDoctor(doctorId);

    res.json({
      success: true,
      data: frequentDiagnoses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllDiagnoses,
  getDiagnosisById,
  getDiagnosisByCode,
  getDiagnosesBySpecialization,
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
  getGeneralDiagnoses,
  getFrequentDiagnosesForDoctor
};