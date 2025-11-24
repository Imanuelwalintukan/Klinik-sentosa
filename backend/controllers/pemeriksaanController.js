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
    createPemeriksaan,
    updatePemeriksaan,
    deletePemeriksaan
};