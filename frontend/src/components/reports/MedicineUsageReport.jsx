import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth
import './ReportPage.css';

const MedicineUsageReport = () => {
  const [mostPrescribedMedicines, setMostPrescribedMedicines] = useState([]);
  const [medicineStockStats, setMedicineStockStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Awal bulan ini
    endDate: new Date().toISOString().split('T')[0] // Hari ini
  });
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchMedicineReports();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [dateRange, isAuthenticated]);

  const fetchMedicineReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ambil obat yang paling sering diresepkan
      const medicineUsageResponse = await axios.get(`/reports/medicines/most-prescribed?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setMostPrescribedMedicines(medicineUsageResponse.data.data);

      // Ambil statistik stok obat (kita akan gunakan endpoint yang sesuai jika sudah ada)
      const stockResponse = await axios.get('/obat');
      setMedicineStockStats(stockResponse.data.data);
    } catch (err) {
      setError('Gagal mengambil data laporan obat');
      console.error('Error fetching medicine report:', err);
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

  if (loading) return <div className="loading">Memuat laporan penggunaan obat...</div>;
  if (error) return <div className="error">{error}</div>;

  // Hitung jumlah obat yang hampir habis (stok < 10)
  const lowStockCount = medicineStockStats.filter(med => med.stok < 10).length;
  const outOfStockCount = medicineStockStats.filter(med => med.stok === 0).length;

  return (
    <div className="medicine-usage-report">
      <h2>Laporan Penggunaan Obat</h2>
      
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

      {/* Ringkasan Obat */}
      <div className="report-summary">
        <div className="summary-card">
          <h3>Obat Paling Sering Diresepkan</h3>
          <p className="summary-value">{mostPrescribedMedicines[0]?.nama_obat || 'Tidak ada'}</p>
        </div>
        <div className="summary-card">
          <h3>Stok Hampir Habis</h3>
          <p className="summary-value">{lowStockCount}</p>
        </div>
        <div className="summary-card">
          <h3>Obat Habis</h3>
          <p className="summary-value">{outOfStockCount}</p>
        </div>
        <div className="summary-card">
          <h3>Total Jenis Obat</h3>
          <p className="summary-value">{medicineStockStats.length}</p>
        </div>
      </div>

      {/* Tabel Obat Paling Sering Diresepkan */}
      <div className="report-section">
        <h3>Obat Paling Sering Diresepkan</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Nama Obat</th>
              <th>Total Jumlah Diresepkan</th>
              <th>Jumlah Resep</th>
              <th>Stok Tersedia</th>
            </tr>
          </thead>
          <tbody>
            {mostPrescribedMedicines.length > 0 ? (
              mostPrescribedMedicines.map((medicine, index) => {
                const stockItem = medicineStockStats.find(m => m.nama_obat === medicine.nama_obat);
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{medicine.nama_obat}</td>
                    <td>{medicine.total_jumlah}</td>
                    <td>{medicine.jumlah_resep}</td>
                    <td>
                      <span className={`stock-status ${stockItem?.stok < 10 ? 'low' : stockItem?.stok === 0 ? 'out' : 'good'}`}>
                        {stockItem ? stockItem.stok : 'N/A'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-data">Tidak ada data obat yang diresepkan dalam periode ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tabel Ketersediaan Obat */}
      <div className="report-section">
        <h3>Ketersediaan Obat</h3>
        <table className="report-table">
          <thead>
            <tr>
              <th>Nama Obat</th>
              <th>Deskripsi</th>
              <th>Stok</th>
              <th>Harga</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {medicineStockStats.length > 0 ? (
              medicineStockStats.map((medicine, index) => (
                <tr key={medicine.id}>
                  <td>{medicine.nama_obat}</td>
                  <td>{medicine.deskripsi || '-'}</td>
                  <td>{medicine.stok}</td>
                  <td>Rp {Number(medicine.harga).toLocaleString('id-ID')}</td>
                  <td>
                    <span className={`stock-status ${medicine.stok < 10 ? 'low' : medicine.stok === 0 ? 'out' : 'good'}`}>
                      {medicine.stok === 0 ? 'Habis' : medicine.stok < 5 ? 'Sangat Rendah' : medicine.stok < 10 ? 'Rendah' : 'Aman'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">Tidak ada data obat dalam sistem.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineUsageReport;