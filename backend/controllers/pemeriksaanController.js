// Controller untuk modul pemeriksaan
const pemeriksaanModel = require('../models/Pemeriksaan');

const getAllPemeriksaan = async (req, res) => {
    try {
        const pemeriksaans = await pemeriksaanModel.getAllPemeriksaan();
        res.json({
            success: true,
            data: pemeriksaans
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getPemeriksaanById = async (req, res) => {
    try {
        const { id } = req.params;
        const pemeriksaan = await pemeriksaanModel.getPemeriksaanById(id);

        if (!pemeriksaan) {
            return res.status(404).json({
                success: false,
                message: 'Pemeriksaan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: pemeriksaan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getPemeriksaanByPasienId = async (req, res) => {
    try {
        const { pasienId } = req.params;
        const pemeriksaans = await pemeriksaanModel.getPemeriksaanByPasienId(pasienId);

        res.json({
            success: true,
            data: pemeriksaans
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const db = require('../config/database');

const createPemeriksaan = async (req, res) => {
    try {
        const pemeriksaanData = req.body;

        // Validasi bahwa pasien dan dokter benar-benar ada
        if (!pemeriksaanData.id_pasien || !pemeriksaanData.id_dokter) {
            return res.status(400).json({
                success: false,
                message: 'ID pasien dan ID dokter wajib diisi'
            });
        }

        // Cek apakah pasien ada
        const pasienCheck = await db.query('SELECT id FROM pasien WHERE id = $1', [pemeriksaanData.id_pasien]);
        if (pasienCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pasien tidak ditemukan'
            });
        }

        // Cek apakah dokter ada
        const dokterCheck = await db.query('SELECT id FROM dokter WHERE id = $1', [pemeriksaanData.id_dokter]);
        if (dokterCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Dokter tidak ditemukan'
            });
        }

        const newPemeriksaan = await pemeriksaanModel.createPemeriksaan(pemeriksaanData);

        res.status(201).json({
            success: true,
            data: newPemeriksaan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updatePemeriksaan = async (req, res) => {
    try {
        const { id } = req.params;
        const pemeriksaanData = req.body;

        // Validasi bahwa pasien dan dokter benar-benar ada (jika disertakan dalam update)
        if (pemeriksaanData.id_pasien) {
            const pasienCheck = await db.query('SELECT id FROM pasien WHERE id = $1', [pemeriksaanData.id_pasien]);
            if (pasienCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Pasien tidak ditemukan'
                });
            }
        }

        if (pemeriksaanData.id_dokter) {
            const dokterCheck = await db.query('SELECT id FROM dokter WHERE id = $1', [pemeriksaanData.id_dokter]);
            if (dokterCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Dokter tidak ditemukan'
                });
            }
        }

        const updatedPemeriksaan = await pemeriksaanModel.updatePemeriksaan(id, pemeriksaanData);

        res.json({
            success: true,
            data: updatedPemeriksaan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getPemeriksaanByUserId = async (req, res) => {
    try {
        const { userId } = req.user; // Dapatkan ID user dari token JWT
        const pemeriksaans = await pemeriksaanModel.getPemeriksaanByUserId(userId);

        res.json({
            success: true,
            data: pemeriksaans
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Fungsi untuk mendapatkan pemeriksaan berdasarkan ID dokter yang sedang login
const getPemeriksaanByDokterId = async (req, res) => {
    try {
        const { userId, role } = req.user; // Dapatkan ID user dan role dari token JWT

        // Untuk dokter, kita perlu mendapatkan id_dokter dari tabel dokter
        // Cek apakah user saat ini adalah dokter
        if (role !== 'dokter') {
            return res.status(403).json({
                success: false,
                message: 'Hanya dokter yang dapat mengakses riwayat pemeriksaan mereka sendiri'
            });
        }

        // Cari id_dokter berdasarkan id_user
        const dokterResult = await db.query('SELECT id FROM dokter WHERE id_user = $1', [userId]);
        if (dokterResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Dokter terkait dengan user ini tidak ditemukan'
            });
        }

        const dokterId = dokterResult.rows[0].id;
        const pemeriksaans = await pemeriksaanModel.getPemeriksaanByDokterId(dokterId);

        res.json({
            success: true,
            data: pemeriksaans
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deletePemeriksaan = async (req, res) => {
    try {
        const { id } = req.params;
        await pemeriksaanModel.deletePemeriksaan(id);

        res.json({
            success: true,
            message: 'Pemeriksaan berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllPemeriksaan,
    getPemeriksaanById,
    getPemeriksaanByPasienId,
    getPemeriksaanByUserId,
    getPemeriksaanByDokterId,
    createPemeriksaan,
    updatePemeriksaan,
    deletePemeriksaan
};