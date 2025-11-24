import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

const ExaminationForm = () => {
  const { id: examinationId } = useParams(); // ID pemeriksaan untuk mode edit
  const [searchParams] = useSearchParams();
  const patientIdFromUrl = searchParams.get('patientId');

  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth(); // Dapatkan status autentikasi

  const [formData, setFormData] = useState({
    id_pasien: '',
    id_dokter: '',
    spesialisasi: '',
    tanggal_pemeriksaan: new Date().toISOString().substring(0, 16), // Default to now
    keluhan: '',
    diagnosa: '',
    kode_diagnosa: '',
    rekomendasi_pengobatan: ''
  });

  const [patientName, setPatientName] = useState('');
  const [initialCheck, setInitialCheck] = useState(null);
  const [availableDiagnoses, setAvailableDiagnoses] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [allDoctorsList, setAllDoctorsList] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ambil spesialisasi dan semua diagnosa saat komponen dimuat (tanpa otentikasi dulu)
  useEffect(() => {
    if (isAuthenticated) {
      fetchSpecializations();
      fetchAllDiagnoses(); // Ambil semua diagnosa terlebih dahulu
    }
  }, [isAuthenticated]);

    // Ambil diagnosa berdasarkan spesialisasi dokter saat dokter dipilih

    useEffect(() => {

      if (isAuthenticated) {

        if (formData.id_dokter && formData.spesialisasi) {

          fetchDiagnosesByDoctorSpecialization(formData.spesialisasi);

        } else if (!formData.id_dokter) {

          // Jika tidak ada dokter dipilih, tampilkan diagnosa umum

          fetchGeneralDiagnoses();

        }

      }

    }, [formData.id_dokter, formData.spesialisasi, isAuthenticated]);

    // Ambil dokter berdasarkan spesialisasi saat dipilih

    const fetchDoctorsBySpecialization = async (specialization) => {

      try {

        if (!isAuthenticated) return; // Tambahkan cek autentikasi

        const response = await axios.get(`/dokter?spesialis=${encodeURIComponent(specialization)}`);

        setAvailableDoctors(response.data.data);

      } catch (error) {

        console.error('Gagal mengambil daftar dokter:', error);

      }

    };

    const fetchSpecializations = async () => {

      try {

        if (!isAuthenticated) return; // Tambahkan cek autentikasi

        const response = await axios.get('/dokter');

        setAllDoctorsList(response.data.data); // Simpan semua dokter

        const allSpecs = [...new Set(response.data.data.map(doc => doc.spesialis).filter(Boolean))];

        setSpecializations(allSpecs);

      } catch (error) {

        console.error('Gagal mengambil daftar spesialisasi:', error);

      }

    };

    // Ambil SEMUA diagnosa (tanpa filter otentikasi sementara)
    const fetchAllDiagnoses = async () => {
      try {
        if (!isAuthenticated) {
          console.log('User tidak terotentikasi saat mengambil semua diagnosa');
          return;
        }

        // Coba ambil semua diagnosa terlebih dahulu
        try {
          const response = await axios.get('/diagnosis');
          if (response.data.success && response.data.data) {
            setAvailableDiagnoses(response.data.data);
            console.log('Semua diagnosa berhasil dimuat');
          }
        } catch (error) {
          console.warn('Gagal mengambil semua diagnosa:', error.message);
          // Jika gagal ambil semua, coba diagnosa umum
          fetchGeneralDiagnoses();
        }
      } catch (error) {
        console.error('Error saat mengambil diagnosa:', error);
        setAvailableDiagnoses([]);
      }
    };

    // Ambil diagnosa umum
    const fetchGeneralDiagnoses = async () => {
      try {
        if (!isAuthenticated) {
          console.log('User tidak terotentikasi saat mengambil diagnosa umum');
          return;
        }

        try {
          const response = await axios.get('/diagnosis/umum');
          console.log('Respons dari /diagnosis/umum:', response.data);

          if (response.data.success && response.data.data) {
            setAvailableDiagnoses(response.data.data);
          } else {
            console.warn('Data diagnosa umum tidak lengkap atau tidak tersedia');
            // Gunakan diagnosa default jika API gagal
            setAvailableDiagnoses([
              { kode_diagnosa: 'Z00.0', nama_diagnosa: 'Pemeriksaan Kesehatan Rutin' },
              { kode_diagnosa: 'R51', nama_diagnosa: 'Sakit Kepala' },
              { kode_diagnosa: 'R10.13', nama_diagnosa: 'Nyeri Perut' },
              { kode_diagnosa: 'R05', nama_diagnosa: 'Batuk' },
              { kode_diagnosa: 'R06.02', nama_diagnosa: 'Sesak Napas' },
              { kode_diagnosa: 'R50.9', nama_diagnosa: 'Demam' }
            ]);
          }
        } catch (error) {
          console.error('Error saat mengambil diagnosa umum:', error);
          // Gunakan diagnosa default jika API gagal
          setAvailableDiagnoses([
            { kode_diagnosa: 'Z00.0', nama_diagnosa: 'Pemeriksaan Kesehatan Rutin' },
            { kode_diagnosa: 'R51', nama_diagnosa: 'Sakit Kepala' },
            { kode_diagnosa: 'R10.13', nama_diagnosa: 'Nyeri Perut' },
            { kode_diagnosa: 'R05', nama_diagnosa: 'Batuk' },
            { kode_diagnosa: 'R06.02', nama_diagnosa: 'Sesak Napas' },
            { kode_diagnosa: 'R50.9', nama_diagnosa: 'Demam' }
          ]);
        }
      } catch (error) {
        console.error('Error lengkap saat mengambil diagnosa umum:', error);
        // Gunakan diagnosa default jika semuanya gagal
        setAvailableDiagnoses([
          { kode_diagnosa: 'Z00.0', nama_diagnosa: 'Pemeriksaan Kesehatan Rutin' },
          { kode_diagnosa: 'R51', nama_diagnosa: 'Sakit Kepala' },
          { kode_diagnosa: 'R10.13', nama_diagnosa: 'Nyeri Perut' },
          { kode_diagnosa: 'R05', nama_diagnosa: 'Batuk' },
          { kode_diagnosa: 'R06.02', nama_diagnosa: 'Sesak Napas' },
          { kode_diagnosa: 'R50.9', nama_diagnosa: 'Demam' }
        ]);
      }
    };

    const fetchDiagnosesByDoctorSpecialization = async (specializationParam = null) => {
      try {
        if (!isAuthenticated) return; // Tambahkan cek autentikasi

        const specializationToUse = specializationParam || formData.spesialisasi;

        if (specializationToUse) {
          try {
            const response = await axios.get(`/diagnosis/spesialisasi/${specializationToUse}`);
            if (response.data.success && response.data.data) {
              setAvailableDiagnoses(response.data.data);
            } else {
              console.warn('Data diagnosa berdasarkan spesialisasi tidak lengkap');
              await fetchGeneralDiagnoses(); // Fallback jika data spesialisasi tidak lengkap
            }
          } catch (error) {
            console.error('Error saat mengambil diagnosa spesialisasi:', error);
            // Jika gagal dengan spesialisasi, kembali ke diagnosa umum
            await fetchGeneralDiagnoses();
          }
        } else {
          // Jika tidak bisa mendapatkan spesialisasi dari dokter, kembalikan ke diagnosa umum
          await fetchGeneralDiagnoses();
        }
      } catch (error) {
        console.warn('Gagal mengambil daftar diagnosa berdasarkan spesialisasi dokter, kembali ke diagnosa umum:', error.message);
        // Jika gagal, kembali ke diagnosa umum
        await fetchGeneralDiagnoses();
      }
    };

  const isEditMode = !!examinationId;

  // Mengatur ID pasien dan dokter
  useEffect(() => {
    const patientId = patientIdFromUrl || (isEditMode ? formData.id_pasien : '');
    let doctorIdToSet = '';
    let doctorSpecializationToSet = '';

    if (isAuthenticated && currentUser && allDoctorsList.length > 0) {
      // Karena sistem otentikasi menggunakan tabel users dan examination menggunakan tabel dokter,
      // kita cocokkan berdasarkan nama bukan ID
      const foundDoctor = allDoctorsList.find(doc => doc.nama === currentUser.nama);
      if (foundDoctor) {
        doctorIdToSet = foundDoctor.id;
        doctorSpecializationToSet = foundDoctor.spesialis || foundDoctor.spesialisasi;
      } else {
        console.warn('Current user name does not match any doctor in the list. Please ensure the logged-in user is a doctor or select one manually.');
      }
    }

    setFormData(prev => ({
      ...prev,
      id_dokter: doctorIdToSet,
      spesialisasi: doctorSpecializationToSet,
      id_pasien: patientId
    }));
  }, [currentUser, patientIdFromUrl, isEditMode, isAuthenticated, allDoctorsList]);

  // Mengambil data yang diperlukan saat komponen dimuat
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (isEditMode) {
      // Mode Edit: Ambil data pemeriksaan yang ada
      setLoading(true);
      axios.get(`/pemeriksaan/${examinationId}`)
        .then(res => {
          setFormData(res.data.data);
          // Setelah data pemeriksaan didapat, ambil nama pasien
          if (res.data.data.id_pasien) {
            axios.get(`/pasien/${res.data.data.id_pasien}`)
              .then(p_res => setPatientName(p_res.data.data.nama))
              .catch(() => setError('Gagal mengambil nama pasien.'));
          }
        })
        .catch(() => setError('Gagal mengambil data pemeriksaan.'))
        .finally(() => setLoading(false));
    } else if (patientIdFromUrl) {
      // Mode Buat Baru: Ambil nama pasien dari URL
      setLoading(true);
      axios.get(`/pasien/${patientIdFromUrl}`)
        .then(p_res => setPatientName(p_res.data.data.nama))
        .catch(() => setError('Gagal mengambil data pasien dari URL.'))
        .finally(() => setLoading(false));
    }
  }, [examinationId, isEditMode, patientIdFromUrl, isAuthenticated]);

  // Mengambil data pemeriksaan awal dari perawat jika ID pasien berubah
  useEffect(() => {
    if (!isAuthenticated) {
      setInitialCheck(null);
      return;
    }

    if (formData.id_pasien && !isNaN(formData.id_pasien)) {
      axios.get(`/pemeriksaan-awal/pasien/${formData.id_pasien}/latest`)
        .then(response => {
          if (response.data.success) {
            setInitialCheck(response.data.data);
          } else {
            setInitialCheck(null);
          }
        })
        .catch(() => setInitialCheck(null)); // Gagal fetch bukan error fatal
    } else {
      setInitialCheck(null);
    }
  }, [formData.id_pasien, isAuthenticated]);


  const handleSpecializationChange = async (e) => {
    const { value } = e.target;
    if (value) {
      await fetchDoctorsBySpecialization(value);
      // Ambil diagnosa berdasarkan spesialisasi yang dipilih
      try {
        const response = await axios.get(`/diagnosis/spesialisasi/${value}`);
        setAvailableDiagnoses(response.data.data);
      } catch (error) {
        console.error('Gagal mengambil daftar diagnosa berdasarkan spesialisasi:', error);
        // Jika gagal, tetap ambil diagnosa umum
        await fetchGeneralDiagnoses();
      }
    } else {
      setAvailableDoctors([]);
      // Jika tidak ada spesialisasi dipilih, tampilkan diagnosa umum
      await fetchGeneralDiagnoses();
    }

    // Juga reset dokter yang dipilih saat spesialisasi berubah
    setFormData(prev => ({
      ...prev,
      spesialisasi: value,
      id_dokter: ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'kode_diagnosa') {
      // Jika diagnosa dipilih dari dropdown, isi field diagnosa dengan nama diagnosa
      const selectedDiagnosis = availableDiagnoses.find(d => d.kode_diagnosa === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        diagnosa: selectedDiagnosis ? selectedDiagnosis.nama_diagnosa : prev.diagnosa
      }));
    } else if (name === 'spesialisasi') {
      // Handle spesialisasi change secara terpisah
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_pasien || !formData.id_dokter) {
        setError('Informasi pasien atau dokter tidak lengkap.');
        return;
    }

    // Jika digunakan kode diagnosa, tambahkan detail diagnosa ke data yang dikirim
    let submitData = { ...formData };
    if (formData.kode_diagnosa) {
      const selectedDiagnosis = availableDiagnoses.find(d => d.kode_diagnosa === formData.kode_diagnosa);
      if (selectedDiagnosis) {
        submitData = {
          ...submitData,
          diagnosa: selectedDiagnosis.nama_diagnosa,
          kode_diagnosa: selectedDiagnosis.kode_diagnosa  // Kirim juga kode diagnosa
        };
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await axios.put(`/pemeriksaan/${examinationId}`, submitData);
        alert('Pemeriksaan berhasil diperbarui');
        navigate(`/examinations/${examinationId}`); // Kembali ke detail pemeriksaan
      } else {
        const response = await axios.post('/pemeriksaan', submitData);
        alert('Pemeriksaan berhasil ditambahkan');
        const newExaminationId = response.data.data.id;
        // Redirect ke form resep dengan ID pemeriksaan baru
        navigate(`/prescriptions/new?examinationId=${newExaminationId}`);
      }
    } catch (err) {
      setError('Gagal menyimpan data pemeriksaan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="examination-form"><h2>Memuat...</h2></div>;
  }

  return (
    <div className="examination-form">
      <h2>{isEditMode ? 'Edit Pemeriksaan' : 'Tambah Pemeriksaan Baru'}</h2>

      {patientName && <h3>Untuk Pasien: {patientName}</h3>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Tampilkan informasi pemeriksaan awal dari perawat jika tersedia */}
        {initialCheck && (
          <div className="initial-check-info">
            <h4>Pemeriksaan Awal oleh Perawat</h4>
            <div className="check-details">
              <div className="detail-row">
                <span className="label">Perawat:</span>
                <span className="value">{initialCheck.nama_perawat || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tanggal:</span>
                <span className="value">{new Date(initialCheck.tanggal_pemeriksaan).toLocaleString('id-ID')}</span>
              </div>
              <div className="vital-signs">
                <div className="vital-group">
                  <div className="vital-item">
                    <span className="label">Berat Badan:</span>
                    <span className="value">{initialCheck.berat_badan ? `${initialCheck.berat_badan} kg` : '-'}</span>
                  </div>
                  <div className="vital-item">
                    <span className="label">Tinggi Badan:</span>
                    <span className="value">{initialCheck.tinggi_badan ? `${initialCheck.tinggi_badan} cm` : '-'}</span>
                  </div>
                </div>
                <div className="vital-group">
                  <div className="vital-item">
                    <span className="label">Tensi:</span>
                    <span className="value">{initialCheck.tensi_sistolik && initialCheck.tensi_diastolik ?
                      `${initialCheck.tensi_sistolik}/${initialCheck.tensi_diastolik} mmHg` : '-'}</span>
                  </div>
                  <div className="vital-item">
                    <span className="label">Suhu:</span>
                    <span className="value">{initialCheck.suhu_tubuh ? `${initialCheck.suhu_tubuh}°C` : '-'}</span>
                  </div>
                </div>
                <div className="vital-group">
                  <div className="vital-item">
                    <span className="label">Denyut Nadi:</span>
                    <span className="value">{initialCheck.denyut_nadi ? `${initialCheck.denyut_nadi} bpm` : '-'}</span>
                  </div>
                  <div className="vital-item">
                    <span className="label">Saturasi O₂:</span>
                    <span className="value">{initialCheck.saturasi_oksigen ? `${initialCheck.saturasi_oksigen}%` : '-'}</span>
                  </div>
                </div>
              </div>
              {initialCheck.riwayat_singkat && (
                <div className="detail-row">
                  <span className="label">Catatan Perawat:</span>
                  <span className="value">{initialCheck.riwayat_singkat}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!initialCheck && formData.id_pasien && (
          <div className="no-initial-check">
            <p>Belum ada pemeriksaan awal dari perawat untuk pasien ini.</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="tanggal_pemeriksaan">Tanggal Pemeriksaan:</label>
          <input
            type="datetime-local"
            id="tanggal_pemeriksaan"
            name="tanggal_pemeriksaan"
            value={formData.tanggal_pemeriksaan ? formData.tanggal_pemeriksaan.substring(0, 16) : ''}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="keluhan">Keluhan:</label>
          <textarea id="keluhan" name="keluhan" value={formData.keluhan} onChange={handleChange} className="form-control" rows="3" required />
        </div>

        <div className="form-group">
          <label htmlFor="kode_diagnosa">Pilih Diagnosa:</label>
          <select
            id="kode_diagnosa"
            name="kode_diagnosa"
            value={formData.kode_diagnosa}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Pilih Diagnosa</option>
            {availableDiagnoses.length > 0 ? (
              availableDiagnoses.map((diagnosa) => (
                <option key={diagnosa.kode_diagnosa} value={diagnosa.kode_diagnosa}>
                  {diagnosa.kode_diagnosa} - {diagnosa.nama_diagnosa}
                </option>
              ))
            ) : (
              <option value="" disabled>Tidak ada diagnosa yang tersedia</option>
            )}
          </select>
          {availableDiagnoses.length === 0 && (
            <small className="form-text">Daftar diagnosa akan muncul setelah dokter atau spesialisasi dipilih</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="diagnosa">Diagnosa Manual (opsional):</label>
          <textarea
            id="diagnosa"
            name="diagnosa"
            value={formData.diagnosa}
            onChange={handleChange}
            className="form-control"
            rows="3"
            placeholder="Alternatif: Masukkan diagnosa secara manual jika tidak ada dalam daftar"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rekomendasi_pengobatan">Rekomendasi Pengobatan:</label>
          <textarea id="rekomendasi_pengobatan" name="rekomendasi_pengobatan" value={formData.rekomendasi_pengobatan} onChange={handleChange} className="form-control" rows="3" />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading || !formData.id_pasien}>
            {loading ? 'Menyimpan...' : (isEditMode ? 'Update Pemeriksaan' : 'Simpan & Lanjut ke Resep')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/examinations')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExaminationForm;