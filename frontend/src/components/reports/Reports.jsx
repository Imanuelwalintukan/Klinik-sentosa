// Reports.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth

const Reports = () => {
  const [reportType, setReportType] = useState('summary');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  // Fungsi untuk mengambil data laporan berdasarkan jenis laporan
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      switch(reportType) {
        case 'summary':
          // Laporan ringkasan: jumlah pasien, dokter, pemeriksaan, dll
          response = await axios.get('/reports/summary');
          break;
        case 'monthly':
          // Laporan bulanan: pemeriksaan per bulan
          response = await axios.get('/reports/monthly');
          break;
        case 'patient-history':
          // Riwayat pemeriksaan pasien
          response = await axios.get('/reports/patient-history');
          break;
        case 'medication-stock':
          // Laporan stok obat
          response = await axios.get('/reports/medication-stock');
          break;
        default:
          throw new Error('Jenis laporan tidak valid');
      }
      
      setReportData(response.data);
    } catch (err) {
      setError('Gagal mengambil data laporan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchReportData();
    }
  }, [reportType, isAuthenticated]);

  const reportTypes = [
    { id: 'summary', name: 'Ringkasan Umum' },
    { id: 'monthly', name: 'Laporan Bulanan' },
    { id: 'patient-history', name: 'Riwayat Pemeriksaan Pasien' },
    { id: 'medication-stock', name: 'Stok Obat' }
  ];

  return (
    <div className="reports-page">
      <h2>Sistem Laporan Klinik</h2>
      
      <div className="report-controls">
        <div className="form-group">
          <label htmlFor="reportType">Jenis Laporan:</label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="form-control"
          >
            {reportTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="loading">Memuat laporan...</div>
      ) : reportData ? (
        <div className="report-content">
          <div className="report-header">
            <h3>{reportTypes.find(t => t.id === reportType)?.name}</h3>
            <button className="btn btn-success" onClick={() => window.print()}>
              Cetak Laporan
            </button>
          </div>
          
          {reportType === 'summary' && (
            <div className="summary-report">
              <div className="summary-grid">
                <div className="summary-card">
                  <h4>Total Pasien</h4>
                  <p className="summary-number">{reportData.totalPatients || 0}</p>
                </div>
                
                <div className="summary-card">
                  <h4>Total Dokter</h4>
                  <p className="summary-number">{reportData.totalDoctors || 0}</p>
                </div>
                
                <div className="summary-card">
                  <h4>Total Pemeriksaan</h4>
                  <p className="summary-number">{reportData.totalExaminations || 0}</p>
                </div>
                
                <div className="summary-card">
                  <h4>Total Obat</h4>
                  <p className="summary-number">{reportData.totalMedications || 0}</p>
                </div>
              </div>
              
              <div className="chart-section">
                <h4>Grafik Pemeriksaan Bulanan</h4>
                <div className="chart-placeholder">
                  {/* Di sini akan ditampilkan grafik pemeriksaan bulanan */}
                  <p>Grafik akan ditampilkan di sini</p>
                </div>
              </div>
            </div>
          )}
          
          {reportType === 'monthly' && (
            <div className="monthly-report">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th>Jumlah Pemeriksaan</th>
                    <th>Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthlyData?.map((month, index) => (
                    <tr key={index}>
                      <td>{month.month}</td>
                      <td>{month.examinationCount}</td>
                      <td>Rp {month.revenue?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {reportType === 'medication-stock' && (
            <div className="medication-stock-report">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Nama Obat</th>
                    <th>Stok Tersedia</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.stockData?.map((medication, index) => (
                    <tr key={index}>
                      <td>{medication.nama_obat}</td>
                      <td>{medication.stok}</td>
                      <td>
                        <span className={`status-badge ${medication.stok < 10 ? 'status-low' : 'status-good'}`}>
                          {medication.stok < 10 ? 'Stok Rendah' : 'Stok Aman'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {reportType === 'patient-history' && (
            <div className="patient-history-report">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID Pasien</th>
                    <th>Nama Pasien</th>
                    <th>Jumlah Pemeriksaan</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.patientHistory?.map((patient, index) => (
                    <tr key={index}>
                      <td>{patient.id_pasien}</td>
                      <td>{patient.nama_pasien}</td>
                      <td>{patient.examinationCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Reports;