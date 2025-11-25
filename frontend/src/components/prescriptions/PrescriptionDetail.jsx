import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

const PrescriptionDetail = () => {
  const { id } = useParams(); // ID ini adalah ID resep individual (bukan ID pemeriksaan)
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPrescription();
    } else {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  const fetchPrescription = async () => {
    try {
      console.log('Mengambil data dengan ID:', id);
      
      // Ambil data resep individual pertama untuk mendapatkan ID pemeriksaan terkait
      const prescriptionResponse = await axios.get(`/resep/${id}`);
      
      if (!prescriptionResponse.data.success || !prescriptionResponse.data.data) {
        throw new Error('Item resep tidak ditemukan');
      }
      
      const item = prescriptionResponse.data.data;
      const pemeriksaanId = item.id_pemeriksaan;
      
      if (!pemeriksaanId) {
        throw new Error('ID pemeriksaan tidak ditemukan dalam data resep');
      }
      
      console.log('ID pemeriksaan ditemukan:', pemeriksaanId);
      
      // Dapatkan informasi pemeriksaan
      const examinationResponse = await axios.get(`/pemeriksaan/${pemeriksaanId}`);
      if (!examinationResponse.data.success || !examinationResponse.data.data) {
        throw new Error('Data pemeriksaan tidak ditemukan');
      }
      
      // Dapatkan semua item resep untuk pemeriksaan ini
      const allPrescriptionItemsResponse = await axios.get(`/resep/pemeriksaan/${pemeriksaanId}`);
      
      const combinedData = {
        pemeriksaan_id: pemeriksaanId,
        nama_pasien: examinationResponse.data.data.nama_pasien,
        nama_dokter: examinationResponse.data.data.nama_dokter,
        tanggal_pemeriksaan: examinationResponse.data.data.tanggal_pemeriksaan,
        items: allPrescriptionItemsResponse.data.data || [],
        status_resep: examinationResponse.data.data.status_resep
      };
      
      setPrescription(combinedData);
    } catch (err) {
      console.error('Error saat mengambil data:', err);
      setError('Gagal mengambil data resep: ' + (err.response?.data?.message || err.message || 'Terjadi kesalahan'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item resep ini?')) {
      try {
        await axios.delete(`/resep/${itemId}`);
        alert('Item resep berhasil dihapus');
        fetchPrescription(); // Refresh data
      } catch (err) {
        setError('Gagal menghapus item resep: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <div className="loading">Memuat data resep...</div>;
  if (error) return <div className="error alert alert-danger">{error}</div>;
  if (!prescription) return <div className="error">Data resep tidak ditemukan</div>;

  return (
    <div className="prescription-detail">
      <div className="header">
        <h2>Detail Resep</h2>
        <div className="actions">
          {/* Hanya tampilkan tombol untuk mengedit jika hanya 1 item resep */}
          {prescription.items?.length === 1 && (
            <button className="btn btn-info mr-2" 
              onClick={() => navigate(`/prescriptions/${prescription.items[0].id}/edit`)}>
              Edit
            </button>
          )}
          <button className="btn btn-success" 
            onClick={() => navigate(`/dispense/${prescription.pemeriksaan_id}`)}>
            Proses Pemberian
          </button>
          <button className="btn btn-secondary" 
            onClick={() => navigate('/prescriptions')}>
            Kembali ke Antrian
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-card">
          <h3>Informasi Pemeriksaan</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">ID Pemeriksaan:</div>
              <div className="detail-value">#{prescription.pemeriksaan_id}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Nama Pasien:</div>
              <div className="detail-value">{prescription.nama_pasien}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Nama Dokter:</div>
              <div className="detail-value">{prescription.nama_dokter}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Tanggal Pemeriksaan:</div>
              <div className="detail-value">
                {prescription.tanggal_pemeriksaan ? 
                  new Date(prescription.tanggal_pemeriksaan).toLocaleDateString('id-ID') : 
                  '-'}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Status Resep:</div>
              <div className="detail-value">
                <span className={`status-badge ${
                  prescription.status_resep === 'Selesai' ? 'status-dispensed' : 'status-pending'
                }`}>
                  {prescription.status_resep || 'Belum Diberikan'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3>Daftar Obat dalam Resep</h3>
          {prescription.items && prescription.items.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Obat</th>
                  <th>Jumlah</th>
                  <th>Aturan Pakai</th>
                  {(currentUser?.role === 'admin') && (
                    <th>Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {prescription.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.nama_obat}</td>
                    <td>{item.jumlah}</td>
                    <td>{item.aturan_pakai}</td>
                    {(currentUser?.role === 'admin') && (
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Tidak ada obat dalam resep ini.</p>
          )}
        </div>

        {prescription.status_resep === 'Selesai' && (
          <div className="alert alert-info">
            Catatan: Resep ini telah selesai diproses dan obat sudah diberikan.
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionDetail;