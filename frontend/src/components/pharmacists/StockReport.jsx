import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';

const StockReport = () => {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    // Apply search and filter
    let results = medications;
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(med =>
        med.nama_obat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply low stock filter
    if (filterLowStock) {
      results = results.filter(med => med.stok < 10);
    }
    
    setFilteredMedications(results);
  }, [medications, searchTerm, filterLowStock]);

  const fetchMedications = async () => {
    try {
      const response = await axios.get('/obat');
      setMedications(response.data.data);
    } catch (err) {
      setError('Gagal mengambil data laporan stok');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalMedications = medications.length;
  const lowStockCount = medications.filter(med => med.stok < 10).length;
  const outOfStockCount = medications.filter(med => med.stok === 0).length;

  if (loading) return <div className="loading">Memuat laporan stok obat...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="stock-report">
      <div className="report-header">
        <h2>Laporan Stok Obat</h2>
        <p>Daftar seluruh obat beserta stok yang tersedia</p>
      </div>

      <div className="report-summary">
        <div className="summary-card">
          <h3>Total Obat</h3>
          <p className="summary-number">{totalMedications}</p>
        </div>
        <div className="summary-card warning">
          <h3>Stok Rendah</h3>
          <p className="summary-number">{lowStockCount}</p>
        </div>
        <div className="summary-card danger">
          <h3>Habis</h3>
          <p className="summary-number">{outOfStockCount}</p>
        </div>
      </div>

      <div className="report-controls">
        <div className="control-group">
          <input
            type="text"
            placeholder="Cari obat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
            />
            Tampilkan hanya stok rendah
          </label>
        </div>
        
        <div className="control-group">
          <button onClick={handlePrint} className="btn btn-primary">
            Cetak Laporan
          </button>
        </div>
      </div>

      {filteredMedications.length === 0 ? (
        <div className="no-results">
          <p>Tidak ada obat yang cocok dengan kriteria pencarian.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Obat</th>
                <th>Deskripsi</th>
                <th>Stok</th>
                <th>Harga</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedications.map((medication) => (
                <tr key={medication.id}>
                  <td>{medication.id}</td>
                  <td>{medication.nama_obat}</td>
                  <td>{medication.deskripsi || '-'}</td>
                  <td>
                    <span className={`stock-indicator ${medication.stok < 10 ? 'low-stock' : ''}`}>
                      {medication.stok}
                    </span>
                  </td>
                  <td>Rp {Number(medication.harga).toLocaleString('id-ID')}</td>
                  <td>
                    <span className={`status ${
                      medication.stok === 0 ? 'status-out' : 
                      medication.stok < 5 ? 'status-low' : 
                      medication.stok < 10 ? 'status-medium' : 'status-good'
                    }`}>
                      {medication.stok === 0 ? 'Habis' : 
                       medication.stok < 5 ? 'Sangat Rendah' : 
                       medication.stok < 10 ? 'Rendah' : 'Aman'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockReport;