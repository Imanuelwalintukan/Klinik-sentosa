import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider';
import './Reports.css';

const Reports = () => {
  const { isAuthenticated } = useAuth();
  const [reportType, setReportType] = useState('summary');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && reportType) {
      fetchReportData();
    }
  }, [reportType, isAuthenticated]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      switch(reportType) {
        case 'summary':
          response = await axios.get('/reports/summary');
          break;
        case 'monthly':
          response = await axios.get('/reports/monthly');
          break;
        case 'medication-stock':
          response = await axios.get('/reports/medication-stock');
          break;
        case 'patient-history':
          response = await axios.get('/reports/patient-history');
          break;
        default:
          setError('Jenis laporan tidak dikenal');
          setLoading(false);
          return;
      }

      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setError(response.data.message || 'Gagal mengambil data laporan');
      }
    } catch (err) {
      setError('Gagal mengambil data laporan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const renderReport = () => {
    if (loading) return <div className="loading">Memuat laporan...</div>;
    if (error) return <div className="error">{error}</div>;

    switch(reportType) {
      case 'summary':
        return <SummaryReport data={reportData} />;
      case 'monthly':
        return <MonthlyReport data={reportData} />;
      case 'medication-stock':
        return <MedicationStockReport data={reportData} />;
      case 'patient-history':
        return <PatientHistoryReport data={reportData} />;
      default:
        return <div>Format laporan tidak dikenal</div>;
    }
  };

  return (
    <div className="reports">
      <h2>Laporan Klinik</h2>
      
      <div className="report-controls">
        <label htmlFor="report-type">Pilih Laporan:</label>
        <select 
          id="report-type"
          value={reportType} 
          onChange={(e) => setReportType(e.target.value)}
          className="report-type-select"
        >
          <option value="summary">Laporan Ringkasan</option>
          <option value="monthly">Laporan Bulanan</option>
          <option value="medication-stock">Stok Obat</option>
          <option value="patient-history">Riwayat Pasien</option>
        </select>
        
        <button className="btn btn-primary" onClick={fetchReportData} disabled={loading}>
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>

      <div className="report-content">
        {renderReport()}
      </div>
    </div>
  );
};

// Komponen untuk laporan ringkasan
const SummaryReport = ({ data }) => {
  if (!data) return <div>Data tidak tersedia</div>;

  return (
    <div className="summary-report">
      <h3>Laporan Ringkasan Klinik</h3>
      <div className="summary-stats">
        <div className="stat-card">
          <h4>{data.totalPatients || 0}</h4>
          <p>Total Pasien</p>
        </div>
        <div className="stat-card">
          <h4>{data.totalDoctors || 0}</h4>
          <p>Total Dokter</p>
        </div>
        <div className="stat-card">
          <h4>{data.totalExaminations || 0}</h4>
          <p>Total Pemeriksaan</p>
        </div>
        <div className="stat-card">
          <h4>{data.totalMedications || 0}</h4>
          <p>Total Obat</p>
        </div>
      </div>
      
      {data.monthlyData && data.monthlyData.length > 0 && (
        <div className="monthly-trend">
          <h4>Tren Bulanan</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Jumlah Pemeriksaan</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyData.map((item, index) => (
                <tr key={index}>
                  <td>{item.month}</td>
                  <td>{item.examinationCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Komponen untuk laporan bulanan
const MonthlyReport = ({ data }) => {
  if (!data || !data.monthlyData) return <div>Data tidak tersedia</div>;

  return (
    <div className="monthly-report">
      <h3>Laporan Bulanan Pemeriksaan</h3>
      {data.monthlyData.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Jumlah Pemeriksaan</th>
              <th>Tren</th>
            </tr>
          </thead>
          <tbody>
            {data.monthlyData.map((item, index) => (
              <tr key={index}>
                <td>{item.month}</td>
                <td>{item.examinationCount}</td>
                <td>
                  {index > 0 ? (
                    <span className={
                      item.examinationCount > data.monthlyData[index-1].examinationCount 
                        ? 'trend-up' 
                        : 'trend-down'
                    }>
                      {item.examinationCount > data.monthlyData[index-1].examinationCount ? '↑' : '↓'}
                    </span>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Tidak ada data bulanan tersedia</p>
      )}
    </div>
  );
};

// Komponen untuk laporan stok obat
const MedicationStockReport = ({ data }) => {
  if (!data || !data.stockData) return <div>Data tidak tersedia</div>;

  const lowStockMedications = data.stockData.filter(med => med.stok < 10);
  const normalStockMedications = data.stockData.filter(med => med.stok >= 10);

  return (
    <div className="medication-stock-report">
      <h3>Laporan Stok Obat</h3>
      
      {lowStockMedications.length > 0 && (
        <div className="low-stock-section">
          <h4>Obat Stok Rendah (Kurang dari 10)</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Nama Obat</th>
                <th>Stok</th>
                <th>Harga</th>
              </tr>
            </thead>
            <tbody>
              {lowStockMedications.map((med, index) => (
                <tr key={med.id} className="low-stock-row">
                  <td>{med.nama_obat}</td>
                  <td><span className="low-stock-badge">{med.stok}</span></td>
                  <td>Rp {med.harga?.toLocaleString('id-ID') || '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="normal-stock-section">
        <h4>Obat dengan Stok Normal</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Nama Obat</th>
              <th>Stok</th>
              <th>Harga</th>
            </tr>
          </thead>
          <tbody>
            {normalStockMedications.map((med, index) => (
              <tr key={med.id}>
                <td>{med.nama_obat}</td>
                <td>{med.stok}</td>
                <td>Rp {med.harga?.toLocaleString('id-ID') || '0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Komponen untuk laporan riwayat pasien
const PatientHistoryReport = ({ data }) => {
  if (!data || !data.patientHistory) return <div>Data tidak tersedia</div>;

  return (
    <div className="patient-history-report">
      <h3>Riwayat Pemeriksaan Pasien</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID Pasien</th>
            <th>Nama Pasien</th>
            <th>Jumlah Pemeriksaan</th>
          </tr>
        </thead>
        <tbody>
          {data.patientHistory.map((patient, index) => (
            <tr key={patient.id_pasien}>
              <td>{patient.id_pasien}</td>
              <td>{patient.nama_pasien}</td>
              <td>{patient.examination_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;