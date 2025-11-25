// PaymentProcessing.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import './PaymentProcessing.css';

const PaymentProcessing = ({ prescriptionId }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [prescription, setPrescription] = useState(null);
  const [payment, setPayment] = useState({
    id_metode_pembayaran: '',
    jumlah_pembayaran: 0,
    jumlah_dibayarkan: 0
  });
  const [changeAmount, setChangeAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentMethods();
    if (prescriptionId) {
      fetchPrescriptionDetails(prescriptionId);
    }
  }, [prescriptionId]);

  useEffect(() => {
    if (payment.jumlah_dibayarkan && payment.jumlah_pembayaran) {
      const calculatedChange = parseFloat(payment.jumlah_dibayarkan) - parseFloat(payment.jumlah_pembayaran);
      setChangeAmount(calculatedChange >= 0 ? calculatedChange : 0);
    }
  }, [payment.jumlah_dibayarkan, payment.jumlah_pembayaran]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('/payments/metode-pembayaran');
      if (response.data.success) {
        setPaymentMethods(response.data.data);
      }
    } catch (err) {
      setError('Gagal mengambil metode pembayaran: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchPrescriptionDetails = async (id) => {
    try {
      // Dalam implementasi nyata, akan mengambil data resep dari endpoint spesifik
      // Untuk sekarang kita hanya simulasikan
      // Misalnya mengambil data dari props atau dari endpoint resep
      console.log('Mengambil detail resep:', id);
    } catch (err) {
      setError('Gagal mengambil detail resep: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const paymentData = {
        ...payment,
        id_resep: prescriptionId, // Harus disediakan dari context
        status_pembayaran: changeAmount >= 0 ? 'lunas' : 'belum_lunas',
        jumlah_kembalian: changeAmount
      };

      const response = await axios.post('/payments/pembayaran', paymentData);

      if (response.data.success) {
        alert('Pembayaran berhasil diproses!');
        // Reset form atau navigasi ke halaman lain
        setPayment({
          id_metode_pembayaran: '',
          jumlah_pembayaran: 0,
          jumlah_dibayarkan: 0
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError('Gagal memproses pembayaran: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-processing">
      <h2>Proses Pembayaran</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="id_metode_pembayaran">Metode Pembayaran:</label>
            <select
              id="id_metode_pembayaran"
              name="id_metode_pembayaran"
              value={payment.id_metode_pembayaran}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Pilih metode pembayaran</option>
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.nama_metode} ({method.jenis_pembayaran})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="jumlah_pembayaran">Jumlah yang Harus Dibayar:</label>
            <input
              type="number"
              id="jumlah_pembayaran"
              name="jumlah_pembayaran"
              value={payment.jumlah_pembayaran}
              onChange={handleInputChange}
              className="form-control"
              min="0"
              step="100"
              required
            />
            <small className="form-text">Total biaya yang harus dibayar</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="jumlah_dibayarkan">Jumlah Dibayarkan:</label>
            <input
              type="number"
              id="jumlah_dibayarkan"
              name="jumlah_dibayarkan"
              value={payment.jumlah_dibayarkan}
              onChange={handleInputChange}
              className="form-control"
              min="0"
              step="100"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="jumlah_kembalian">Jumlah Kembalian:</label>
            <input
              type="number"
              id="jumlah_kembalian"
              value={changeAmount}
              readOnly
              className="form-control readonly"
              style={{ backgroundColor: '#e9ecef' }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Memproses...' : 'Proses Pembayaran'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => {
              // Reset form
              setPayment({
                id_metode_pembayaran: '',
                jumlah_pembayaran: 0,
                jumlah_dibayarkan: 0
              });
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {changeAmount > 0 && (
        <div className="payment-summary">
          <h3>Ringkasan Pembayaran</h3>
          <div className="summary-row">
            <span className="label">Jumlah Bayar:</span>
            <span className="value">Rp {parseFloat(payment.jumlah_pembayaran).toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span className="label">Dibayarkan:</span>
            <span className="value">Rp {parseFloat(payment.jumlah_dibayarkan).toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span className="label">Kembalian:</span>
            <span className="value">Rp {changeAmount.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessing;