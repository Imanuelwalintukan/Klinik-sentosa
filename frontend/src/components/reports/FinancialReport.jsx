import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './ReportPage.css';

const FinancialReport = () => {
  const [financialData, setFinancialData] = useState({});
  const [dailyIncome, setDailyIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Awal bulan ini
    endDate: new Date().toISOString().split('T')[0] // Hari ini
  });
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchFinancialReport();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [dateRange, isAuthenticated]);

  const fetchFinancialReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/reports/financial?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setFinancialData(response.data.data);

      const dailyResponse = await axios.get(`/reports/income/daily?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setDailyIncome(dailyResponse.data.data);
    } catch (err) {
      setError('Gagal mengambil data laporan keuangan');
      console.error('Error fetching financial report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="loading">Memuat laporan keuangan...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="financial-report">
      <h2>Laporan Keuangan Klinik</h2>
      
      {/* Filter Tanggal */}
      <div className="date-filter">
        <div className="form-group">
          <label htmlFor="startDate">Tanggal Mulai:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">Tanggal Akhir:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            className="form-control"
          />
        </div>
      </div>

      {/* Ringkasan Keuangan */}
      <div className="report-summary">
        <div className="summary-card">
          <h3>Total Pendapatan</h3>
          <p className="summary-value">Rp {financialData.total_pendapatan ? Number(financialData.total_pendapatan).toLocaleString('id-ID') : '0'}</p>
        </div>
        <div className="summary-card">
          <h3>Jumlah Pasien Berobat</h3>
          <p className="summary-value">{financialData.jumlah_pasien_berobat || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Rata-rata Per Pasien</h3>
          <p className="summary-value">Rp {financialData.rata_rata_pembayaran_per_pasien ? Number(financialData.rata_rata_pembayaran_per_pasien).toLocaleString('id-ID') : '0'}</p>
        </div>
        <div className="summary-card">
          <h3>Jumlah Resep Dibuat</h3>
          <p className="summary-value">{financialData.total_resep || 0}</p>
        </div>
      </div>

      {/* Grafik Pendapatan Harian */}
      <div className="report-section">
        <h3>Grafik Pendapatan Harian</h3>
        <div className="chart-container">
          {dailyIncome.length > 0 ? (
            <div className="daily-chart">
              {dailyIncome.map((day, index) => (
                <div key={index} className="chart-bar">
                  <div className="bar-value">Rp {(day.total_pendapatan || 0).toLocaleString('id-ID')}</div>
                  <div 
                    className="bar" 
                    style={{ height: `${Math.min(day.total_pendapatan / 10000, 150)}px` }}
                    title={`${day.tanggal}: Rp ${Number(day.total_pendapatan || 0).toLocaleString('id-ID')}`}
                  >
                    <div className="bar-label">{new Date(day.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Tidak ada data pendapatan dalam periode ini.</p>
          )}
        </div>
      </div>

      {/* Laporan Detail */}
      <div className="report-section">
        <h3>Detail Transaksi</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Nama Pasien</th>
              <th>Dokter</th>
              <th>Jumlah Pembayaran</th>
              <th>Jumlah Resep</th>
            </tr>
          </thead>
          <tbody>
            {dailyIncome.length > 0 ? (
              dailyIncome.map((transaction, index) => (
                <tr key={index}>
                  <td>{new Date(transaction.tanggal_pembayaran).toLocaleDateString('id-ID')}</td>
                  <td>{transaction.nama_pasien}</td>
                  <td>{transaction.nama_dokter}</td>
                  <td>Rp {Number(transaction.total_pembayaran).toLocaleString('id-ID')}</td>
                  <td>{transaction.jumlah_resep}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">Tidak ada transaksi dalam periode ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialReport;