// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalExaminations: 0,
    totalMedications: 0,
    recentExaminations: [],
    upcomingAppointments: [],
    lowStockMedications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Ambil data ringkasan
      const summaryResponse = await axios.get('/api/reports/summary');
      const summaryData = summaryResponse.data.data;

      // Ambil data pemeriksaan terbaru
      const examinationsResponse = await axios.get('/api/pemeriksaan');
      const recentExaminations = examinationsResponse.data.data.slice(0, 5);

      // Ambil data stok obat rendah
      const medicationsResponse = await axios.get('/api/reports/medication-stock');
      const lowStockMedications = medicationsResponse.data.data.stockData
        .filter(med => med.stok < 10)
        .slice(0, 5);

      setDashboardData({
        totalPatients: summaryData.totalPatients,
        totalDoctors: summaryData.totalDoctors,
        totalExaminations: summaryData.totalExaminations,
        totalMedications: summaryData.totalMedications,
        recentExaminations,
        upcomingAppointments: [], // Ini akan diisi dari endpoint penjadwalan jika sudah dibuat
        lowStockMedications
      });
      setLoading(false);
    } catch (err) {
      setError('Gagal mengambil data dashboard: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Memuat dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h2>Dashboard Klinik Sentosa</h2>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{dashboardData.totalPatients}</h3>
          <p>Total Pasien</p>
        </div>
        
        <div className="stat-card">
          <h3>{dashboardData.totalDoctors}</h3>
          <p>Total Dokter</p>
        </div>
        
        <div className="stat-card">
          <h3>{dashboardData.totalExaminations}</h3>
          <p>Total Pemeriksaan</p>
        </div>
        
        <div className="stat-card">
          <h3>{dashboardData.totalMedications}</h3>
          <p>Total Obat</p>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-column">
          <div className="dashboard-card">
            <h3>Pemeriksaan Terbaru</h3>
            <div className="recent-examinations">
              {dashboardData.recentExaminations.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nama Pasien</th>
                      <th>Nama Dokter</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentExaminations.map(exam => (
                      <tr key={exam.id}>
                        <td>{exam.id}</td>
                        <td>{exam.nama_pasien}</td>
                        <td>{exam.nama_dokter}</td>
                        <td>{exam.tanggal_pemeriksaan ? new Date(exam.tanggal_pemeriksaan).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Tidak ada data pemeriksaan terbaru</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="dashboard-column">
          <div className="dashboard-card">
            <h3>Obat Stok Rendah</h3>
            <div className="low-stock-medications">
              {dashboardData.lowStockMedications.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nama Obat</th>
                      <th>Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.lowStockMedications.map(med => (
                      <tr key={med.id} className="low-stock-row">
                        <td>{med.nama_obat}</td>
                        <td><span className="low-stock-badge">{med.stok}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Tidak ada obat dengan stok rendah</p>
              )}
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>Jadwal Mendatang</h3>
            <div className="upcoming-appointments">
              <p>Fitur penjadwalan akan segera hadir</p>
              {/* Komponen jadwal akan ditambahkan di sini */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;