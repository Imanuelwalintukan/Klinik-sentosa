import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './ReportPage.css';

const MonthlyReport = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchMonthlyReport();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [selectedYear, isAuthenticated]);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ambil laporan bulanan
      const response = await axios.get(`/reports/monthly?year=${selectedYear}`);
      setMonthlyData(response.data.data);

      // Ambil ringkasan tahunan
      const summaryResponse = await axios.get(`/reports/summary?startDate=${selectedYear}-01-01&endDate=${selectedYear}-12-31`);
      setSummary(summaryResponse.data.data);
    } catch (err) {
      setError('Gagal mengambil data laporan bulanan');
      console.error('Error fetching monthly report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  // Fungsi untuk mendapatkan nama bulan
  const getMonthName = (monthNumber) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthNumber - 1] || 'Invalid Month';
  };

  if (loading) return <div className="loading">Memuat laporan bulanan...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="monthly-report">
      <h2>Laporan Bulanan Klinik Sentosa - Tahun {selectedYear}</h2>
      
      <div className="report-controls">
        <div className="form-group">
          <label htmlFor="year">Pilih Tahun:</label>
          <select
            id="year"
            value={selectedYear}
            onChange={handleYearChange}
            className="form-control"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ringkasan Tahunan */}
      <div className="report-summary">
        <div className="summary-card">
          <h3>Total Pemeriksaan</h3>
          <p className="summary-value">{summary.total_pemeriksaan || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Pasien Pria</h3>
          <p className="summary-value">{summary.jumlah_pasien_laki || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Pasien Wanita</h3>
          <p className="summary-value">{summary.jumlah_pasien_perempuan || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Rata-rata Usia</h3>
          <p className="summary-value">{summary.rata_rata_usia_pasien ? parseFloat(summary.rata_rata_usia_pasien).toFixed(1) : 0} Tahun</p>
        </div>
      </div>

      {/* Tabel Laporan Bulanan */}
      <div className="report-section">
        <h3>Statistik per Bulan</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Jumlah Pemeriksaan</th>
              <th>Pasien Pria</th>
              <th>Pasien Wanita</th>
              <th>Rata-rata Per Hari</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.length > 0 ? (
              monthlyData.map((month, index) => (
                <tr key={month.bulan}>
                  <td>{getMonthName(month.bulan)}</td>
                  <td>{month.jumlah_pemeriksaan}</td>
                  <td>{month.pria}</td>
                  <td>{month.wanita}</td>
                  <td>{(month.jumlah_pemeriksaan / 30).toFixed(1)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">Tidak ada data untuk tahun ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grafik Bulanan */}
      <div className="report-section">
        <h3>Grafik Pemeriksaan Bulanan</h3>
        <div className="chart-container">
          {monthlyData.length > 0 ? (
            <div className="monthly-chart">
              {monthlyData.map((month, index) => (
                <div key={month.bulan} className="chart-column">
                  <div 
                    className="column-value"
                    title={`${getMonthName(month.bulan)}: ${month.jumlah_pemeriksaan} pemeriksaan`}
                  >
                    {month.jumlah_pemeriksaan}
                  </div>
                  <div 
                    className="column" 
                    style={{ height: `${Math.min(month.jumlah_pemeriksaan / 5, 150)}px` }}
                  >
                    <div className="column-label">{getMonthName(month.bulan).substring(0, 3)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Tidak ada data untuk ditampilkan dalam grafik.</p>
          )}
        </div>
      </div>

      {/* Tren Diagnosa Teratas Tahunan */}
      <div className="report-section">
        <h3>Diagnosa Teratas Tahun {selectedYear}</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Diagnosa</th>
              <th>Jumlah Kasus</th>
              <th>Persen</th>
            </tr>
          </thead>
          <tbody>
            {summary.diagnosa_teratas ? (
              summary.diagnosa_teratas.map((diagnosa, index) => (
                <tr key={index}>
                  <td>{diagnosa.nama_diagnosa}</td>
                  <td>{diagnosa.jumlah_kasus}</td>
                  <td>{diagnosa.persen_kasus}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">Data diagnosa tahun ini belum tersedia.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyReport;