// PaymentMethodManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import './PaymentMethodManagement.css';

const PaymentMethodManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentMethod, setCurrentMethod] = useState(null);
  const [formData, setFormData] = useState({
    nama_metode: '',
    deskripsi: '',
    jenis_pembayaran: 'tunai'
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/payments/metode-pembayaran');
      if (response.data.success) {
        setPaymentMethods(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError('Gagal mengambil metode pembayaran: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentMethod) {
        // Update metode pembayaran
        await axios.put(`/payments/metode-pembayaran/${currentMethod.id}`, formData);
      } else {
        // Tambah metode pembayaran baru
        await axios.post('/payments/metode-pembayaran', formData);
      }
      
      setFormData({ nama_metode: '', deskripsi: '', jenis_pembayaran: 'tunai' });
      setCurrentMethod(null);
      setShowForm(false);
      fetchPaymentMethods();
    } catch (err) {
      setError('Gagal menyimpan metode pembayaran: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (method) => {
    setCurrentMethod(method);
    setFormData({
      nama_metode: method.nama_metode,
      deskripsi: method.deskripsi || '',
      jenis_pembayaran: method.jenis_pembayaran || 'tunai'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menonaktifkan metode pembayaran ini?')) {
      try {
        await axios.delete(`/payments/metode-pembayaran/${id}`);
        fetchPaymentMethods();
      } catch (err) {
        setError('Gagal menonaktifkan metode pembayaran: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleAddNew = () => {
    setCurrentMethod(null);
    setFormData({ nama_metode: '', deskripsi: '', jenis_pembayaran: 'tunai' });
    setShowForm(true);
  };

  if (loading) {
    return <div className="loading">Memuat metode pembayaran...</div>;
  }

  return (
    <div className="payment-method-management">
      <div className="payment-method-header">
        <h2>Manajemen Metode Pembayaran</h2>
        <button className="btn btn-primary" onClick={handleAddNew}>
          Tambah Metode Pembayaran
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="payment-method-form-container">
          <form onSubmit={handleSubmit} className="payment-method-form">
            <h3>{currentMethod ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran Baru'}</h3>
            
            <div className="form-group">
              <label>Nama Metode:</label>
              <input
                type="text"
                name="nama_metode"
                value={formData.nama_metode}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Deskripsi:</label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Jenis Pembayaran:</label>
              <select
                name="jenis_pembayaran"
                value={formData.jenis_pembayaran}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="tunai">Tunai</option>
                <option value="non_tunai">Non-Tunai</option>
                <option value="jaminan">Jaminan (BPJS, Asuransi)</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {currentMethod ? 'Perbarui' : 'Simpan'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="payment-method-list">
        <h3>Daftar Metode Pembayaran</h3>
        {paymentMethods.length > 0 ? (
          <table className="payment-method-table">
            <thead>
              <tr>
                <th>Nama Metode</th>
                <th>Jenis</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map(method => (
                <tr key={method.id}>
                  <td>{method.nama_metode}</td>
                  <td>{method.jenis_pembayaran}</td>
                  <td>{method.deskripsi || '-'}</td>
                  <td>
                    <span className={`status-badge ${method.is_active ? 'status-active' : 'status-inactive'}`}>
                      {method.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-info btn-sm" 
                      onClick={() => handleEdit(method)}
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDelete(method.id)}
                    >
                      Nonaktifkan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Belum ada metode pembayaran yang terdaftar.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodManagement;