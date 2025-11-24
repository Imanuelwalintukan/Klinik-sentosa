// Controller untuk sistem pelaporan
const reportModel = require('../models/ReportModel');

// Mendapatkan ringkasan pemeriksaan
const getExaminationSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parameter startDate dan endDate harus disertakan'
      });
    }
    
    const summary = await reportModel.getExaminationSummary(startDate, endDate);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan laporan pemeriksaan per periode
const getExaminationsByPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parameter startDate dan endDate harus disertakan'
      });
    }
    
    const examinations = await reportModel.getExaminationsByPeriod(startDate, endDate);
    res.json({
      success: true,
      data: examinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan laporan pemeriksaan per dokter
const getExaminationsByDoctor = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parameter startDate dan endDate harus disertakan'
      });
    }
    
    const examinations = await reportModel.getExaminationsByDoctor(startDate, endDate);
    res.json({
      success: true,
      data: examinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan tren diagnosa
const getDiagnosisTrends = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parameter startDate dan endDate harus disertakan'
      });
    }
    
    const trends = await reportModel.getDiagnosisTrends(startDate, endDate);
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan laporan pasien per kategori usia
const getPatientsByAgeCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parameter startDate dan endDate harus disertakan'
      });
    }
    
    const patients = await reportModel.getPatientsByAgeCategory(startDate, endDate);
    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan obat yang paling sering diresepkan
const getMostPrescribedMedicines = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parameter startDate dan endDate harus disertakan'
      });
    }
    
    const medicines = await reportModel.getMostPrescribedMedicines(startDate, endDate);
    res.json({
      success: true,
      data: medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan laporan keuangan
const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parameter startDate dan endDate harus disertakan'
      });
    }
    
    const financial = await reportModel.getFinancialReport(startDate, endDate);
    res.json({
      success: true,
      data: financial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mendapatkan laporan bulanan
const getMonthlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Parameter year harus disertakan'
      });
    }
    
    const monthlyData = await reportModel.getMonthlyReport(year);
    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getExaminationSummary,
  getExaminationsByPeriod,
  getExaminationsByDoctor,
  getDiagnosisTrends,
  getPatientsByAgeCategory,
  getMostPrescribedMedicines,
  getFinancialReport,
  getMonthlyReport
};