import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../axiosConfig';
import './ProcessPayment.css';

const ProcessPayment = () => {
  const [unpaidPrescriptions, setUnpaidPrescriptions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [paymentData, setPaymentData] = useState({
    id_pemeriksaan: null,
    id_metode_pembayaran: '',
    jumlah_pembayaran: 0,
    jumlah_dibayarkan: '',
    jumlah_kembalian: 0,
    status_pembayaran: 'lunas',
    keterangan: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUnpaidPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/resep/unpaid');
      if (response.data.success) {
        setUnpaidPrescriptions(response.data.data);
      }
    } catch (err) {
      setError('Gagal mengambil data resep yang belum lunas: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchUnpaidPrescriptions();
    fetchPaymentMethods();
  }, [fetchUnpaidPrescriptions]);

  const handleOpenPaymentModal = (prescription) => {
    setSelectedPrescription(prescription);
    setPaymentData({
      id_pemeriksaan: prescription.id_pemeriksaan,
      id_metode_pembayaran: paymentMethods.length > 0 ? paymentMethods[0].id : '',
      jumlah_pembayaran: prescription.total_biaya,
      jumlah_dibayarkan: '',
      jumlah_kembalian: 0,
      status_pembayaran: 'lunas',
      keterangan: `Pembayaran untuk resep pasien ${prescription.nama_pasien}`
    });
  };

  const handleCloseModal = () => {
    setSelectedPrescription(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newPaymentData = { ...paymentData, [name]: value };

    if (name === 'jumlah_dibayarkan') {
      const dibayarkan = parseFloat(value) || 0;
      const total = parseFloat(paymentData.jumlah_pembayaran);
      const kembalian = dibayarkan - total;
      newPaymentData.jumlah_kembalian = kembalian >= 0 ? kembalian : 0;
    }

    setPaymentData(newPaymentData);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!paymentData.id_metode_pembayaran) {
      setError('Silakan pilih metode pembayaran.');
      return;
    }
    
    if (parseFloat(paymentData.jumlah_dibayarkan) < parseFloat(paymentData.jumlah_pembayaran)) {
        setError('Jumlah yang dibayarkan kurang dari total tagihan.');
        return;
    }

    try {
      const res = await axios.post('/payments/pembayaran', paymentData);
      if (res.data.success) {
        handleCloseModal();
        fetchUnpaidPrescriptions(); // Refresh list
      }
    } catch (err) {
      setError('Gagal menyimpan pembayaran: ' + (err.response?.data?.message || err.message));
    }
  };
  
  return (
    <div className="process-payment-container">
      <h2>Proses Pembayaran Resep</h2>
      {loading && <p>Memuat...</p>}
      {error && !selectedPrescription && <div className="alert alert-danger">{error}</div>}
      
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID Pemeriksaan</th>
            <th>Pasien</th>
            <th>Dokter</th>
            <th>Tanggal</th>
            <th>Detail Obat</th>
            <th>Total Biaya</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {unpaidPrescriptions.map(p => (
            <tr key={p.id_pemeriksaan}>
              <td>{p.id_pemeriksaan}</td>
              <td>{p.nama_pasien}</td>
              <td>{p.nama_dokter}</td>
              <td>{new Date(p.tanggal_pemeriksaan).toLocaleDateString()}</td>
              <td>{p.detail_obat}</td>
              <td>Rp {new Intl.NumberFormat('id-ID').format(p.total_biaya)}</td>
              <td>
                <button className="btn btn-success" onClick={() => handleOpenPaymentModal(p)}>
                  Bayar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPrescription && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Pembayaran Resep: {selectedPrescription.nama_pasien}</h3>
            <p>Total Tagihan: <strong>Rp {new Intl.NumberFormat('id-ID').format(selectedPrescription.total_biaya)}</strong></p>
            <hr />
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmitPayment}>
              <div className="form-group">
                <label>Metode Pembayaran</label>
                <select name="id_metode_pembayaran" value={paymentData.id_metode_pembayaran} onChange={handleInputChange} className="form-control">
                  {paymentMethods.map(m => (
                    <option key={m.id} value={m.id}>{m.nama_metode}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Jumlah Dibayarkan</label>
                <input
                  type="number"
                  name="jumlah_dibayarkan"
                  value={paymentData.jumlah_dibayarkan}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Masukkan jumlah"
                  required
                />
              </div>
              <div className="form-group">
                <label>Kembalian</label>
                <input
                  type="text"
                  name="jumlah_kembalian"
                  value={`Rp ${new Intl.NumberFormat('id-ID').format(paymentData.jumlah_kembalian)}`}
                  className="form-control"
                  disabled
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Konfirmasi Bayar</button>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessPayment;
