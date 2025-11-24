import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './ReportPage.css';

const ReportDashboard = () => {
  const [reports, setReports] = useState({
    summary: {},
    dailyTrend: [],
    doctorStats: [],
    diagnosisTrends: [],
    ageDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Awal bulan ini
    endDate: new Date().toISOString().split('T')[0] // Hari ini
  });
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchReports();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [dateRange, isAuthenticated]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ambil semua data laporan sekaligus
      const [summaryRes, dailyRes, doctorRes, diagnosisRes, ageRes] = await Promise.allSettled([
        axios.get(`/reports/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get(`/reports/examinations/period?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get(`/reports/examinations/doctor?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get(`/reports/diagnosis/trends?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get(`/reports/patients/age-category?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      ]);

      // Perbarui state berdasarkan hasil masing-masing permintaan
      if (summaryRes.status === 'fulfilled') {
        setReports(prev => ({ ...prev, summary: summaryRes.value.data.data }));
      }

      if (dailyRes.status === 'fulfilled') {
        setReports(prev => ({ ...prev, dailyTrend: dailyRes.value.data.data }));
      }

      if (doctorRes.status === 'fulfilled') {
        setReports(prev => ({ ...prev, doctorStats: doctorRes.value.data.data }));
      }

      if (diagnosisRes.status === 'fulfilled') {
        setReports(prev => ({ ...prev, diagnosisTrends: diagnosisRes.value.data.data }));
      }

      if (ageRes.status === 'fulfilled') {
        setReports(prev => ({ ...prev, ageDistribution: ageRes.value.data.data }));
      }
    } catch (err) {
      setError('Gagal mengambil data laporan');
      console.error('Error fetching reports:', err);
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

  if (loading) return <div className="loading">Memuat laporan...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="report-dashboard">
      <h2>Dasbor Laporan Klinik Sentosa</h2>
      
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

      {/* Kartu Ringkasan */}
      <div className="report-summary">
        <div className="summary-card">
          <h3>Jumlah Pemeriksaan</h3>
          <p className="summary-value">{reports.summary.total_pemeriksaan || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Jumlah Pasien Laki-laki</h3>
          <p className="summary-value">{reports.summary.jumlah_pasien_laki || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Jumlah Pasien Perempuan</h3>
          <p className="summary-value">{reports.summary.jumlah_pasien_perempuan || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Rata-rata Usia Pasien</h3>
          <p className="summary-value">{reports.summary.rata_rata_usia_pasien ? parseFloat(reports.summary.rata_rata_usia_pasien).toFixed(1) + ' tahun' : 'N/A'}</p>
        </div>
      </div>

      {/* Grafik Tren Harian */}
      <div className="report-section">
        <h3>Tren Pemeriksaan Harian</h3>
        <div className="chart-container">
          {reports.dailyTrend.length > 0 ? (
            <div className="daily-chart">
              {reports.dailyTrend.map((day, index) => (
                <div key={index} className="chart-bar">
                  <div className="bar-value">{day.jumlah_pemeriksaan}</div>
                  <div 
                    className="bar" 
                    style={{ height: `${Math.min(day.jumlah_pemeriksaan * 10, 150)}px` }}
                    title={`${day.tanggal}: ${day.jumlah_pemeriksaan} pemeriksaan`}
                  >
                    <div className="bar-label">{new Date(day.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Tidak ada data pemeriksaan dalam periode ini.</p>
          )}
        </div>
      </div>

      <div className="report-grid">
        {/* Statistik Dokter */}
        <div className="report-section">
          <h3>Pemeriksaan Berdasarkan Dokter</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Nama Dokter</th>
                <th>Spesialis</th>
                <th>Jumlah Pemeriksaan</th>
              </tr>
            </thead>
            <tbody>
              {reports.doctorStats.length > 0 ? (
                reports.doctorStats.map((doc, index) => (
                  <tr key={index}>
                    <td>{doc.nama_dokter}</td>
                    <td>{doc.spesialis_dokter}</td>
                    <td>{doc.jumlah_pemeriksaan}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">Tidak ada data pemeriksaan dalam periode ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tren Diagnosa */}
        <div className="report-section">
          <h3>Tren Diagnosa Teratas</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Diagnosa</th>
                <th>Frekuensi</th>
              </tr>
            </thead>
            <tbody>
              {reports.diagnosisTrends.length > 0 ? (
                reports.diagnosisTrends.map((diag, index) => (
                  <tr key={index}>
                    <td>{diag.diagnosa}</td>
                    <td>{diag.frekuensi}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="no-data">Tidak ada data diagnosa dalam periode ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Distribusi Usia */}
        <div className="report-section">
          <h3>Distribusi Pasien Berdasarkan Usia</h3>
          <div className="chart-container">
            {reports.ageDistribution.length > 0 ? (
              <div className="pie-chart">
                {reports.ageDistribution.map((category, index) => (
                  <div key={index} className="pie-slice">
                    <div className="slice-label">{category.kategori_usia}</div>
                    <div className="slice-value">{category.jumlah_pasien}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">Tidak ada data pasien dalam periode ini.</p>
            )}
          </div>
        </div>

        {/* Tautan ke Laporan Lengkap */}
        <div className="report-section">
          <h3>Modul Laporan Lengkap</h3>
          <div className="report-modules">
            <a href="/reports/financial" className="report-module-link">
              <div className="module-card">
                <h4>Laporan Keuangan</h4>
                <p>Analisis pendapatan dan pengeluaran klinik</p>
              </div>
            </a>
            <a href="/reports/medicine-usage" className="report-module-link">
              <div className="module-card">
                <h4>Penggunaan Obat</h4>
                <p>Analisis obat yang sering diresepkan</p>
              </div>
            </a>
            <a href="/reports/monthly-summary" className="report-module-link">
              <div className="module-card">
                <h4>Ringkasan Bulanan</h4>
                <p>Data kinerja klinik per bulan</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;