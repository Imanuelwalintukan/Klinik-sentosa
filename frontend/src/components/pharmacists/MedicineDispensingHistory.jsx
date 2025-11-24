import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useAuth } from '../auth/AuthProvider'; // Import useAuth

const MedicineDispensingHistory = () => {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const { isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  useEffect(() => {
    if (isAuthenticated) { // Hanya fetch jika sudah terautentikasi
      fetchDispensedExaminations();
    } else {
      setLoading(false); // Jika tidak terautentikasi, hentikan loading
    }
  }, [isAuthenticated]);

  const fetchDispensedExaminations = async () => {
    try {
      // Ambil semua pemeriksaan yang statusnya 'Selesai' (artinya obat sudah diberikan)
      const response = await axios.get('/pemeriksaan');
      const allExaminations = response.data.data;
      
      // Filter hanya pemeriksaan dengan status 'Selesai'
      const dispensedExaminations = allExaminations.filter(exam => 
        exam.status_resep === 'Selesai'
      );
      
      setExaminations(dispensedExaminations);
    } catch (err) {
      setError('Gagal mengambil riwayat pemberian obat');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptionDetails = async (examinationId) => {
    try {
      const response = await axios.get(`/resep/pemeriksaan/${examinationId}`);
      return response.data.data;
    } catch (err) {
      setError('Gagal mengambil detail resep');
      return [];
    }
  };

  const handleViewDetails = async (examination) => {
    const prescriptionDetails = await fetchPrescriptionDetails(examination.id);
    setSelectedExam({
      ...examination,
      resep: prescriptionDetails
    });
  };

  const handleCloseDetails = () => {
    setSelectedExam(null);
  };

  if (loading) return <div className="loading">Memuat riwayat pemberian obat...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="medicine-dispensing-history">
      <h2>Riwayat Pemberian Obat</h2>
      <p>Daftar pemeriksaan yang telah diselesaikan dan obatnya telah diberikan kepada pasien</p>
      
      {examinations.length === 0 ? (
        <div className="no-history">
          <p>Belum ada riwayat pemberian obat.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID Pemeriksaan</th>
              <th>Pasien</th>
              <th>Dokter</th>
              <th>Tanggal Pemeriksaan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {examinations.map((examination) => (
              <tr key={examination.id}>
                <td>{examination.id}</td>
                <td>{examination.nama_pasien}</td>
                <td>{examination.nama_dokter}</td>
                <td>{new Date(examination.tanggal_pemeriksaan).toLocaleDateString('id-ID')}</td>
                <td>
                  <span className="status status-completed">
                    {examination.status_resep}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleViewDetails(examination)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal untuk menampilkan detail resep */}
      {selectedExam && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Resep - Pemeriksaan #{selectedExam.id}</h3>
              <button className="close-button" onClick={handleCloseDetails}>×</button>
            </div>
            <div className="modal-body">
              <div className="exam-info">
                <p><strong>Pasien:</strong> {selectedExam.nama_pasien}</p>
                <p><strong>Dokter:</strong> {selectedExam.nama_dokter}</p>
                <p><strong>Tanggal:</strong> {new Date(selectedExam.tanggal_pemeriksaan).toLocaleDateString('id-ID')}</p>
                <p><strong>Status:</strong> <span className="status status-completed">{selectedExam.status_resep}</span></p>
              </div>
              
              <h4>Obat yang Diberikan:</h4>
              {selectedExam.resep && selectedExam.resep.length > 0 ? (
                <table className="sub-table">
                  <thead>
                    <tr>
                      <th>Nama Obat</th>
                      <th>Jumlah</th>
                      <th>Aturan Pakai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedExam.resep.map((resep) => (
                      <tr key={resep.id}>
                        <td>{resep.nama_obat}</td>
                        <td>{resep.jumlah}</td>
                        <td>{resep.aturan_pakai}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Tidak ada resep tercatat untuk pemeriksaan ini.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineDispensingHistory;