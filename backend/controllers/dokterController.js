// Controller untuk modul dokter
const dokterModel = require('../models/Dokter');

const getAllDokter = async (req, res) => {
    try {
        const dokters = await dokterModel.getAllDokter();
        res.json({
            success: true,
            data: dokters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getDokterById = async (req, res) => {
    try {
        const { id } = req.params;
        const dokter = await dokterModel.getDokterById(id);

        if (!dokter) {
            return res.status(404).json({
                success: false,
                message: 'Dokter tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: dokter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createDokter = async (req, res) => {
    try {
        const dokterData = req.body;
        const newDokter = await dokterModel.createDokter(dokterData);

        res.status(201).json({
            success: true,
            data: newDokter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateDokter = async (req, res) => {
    try {
        const { id } = req.params;
        const dokterData = req.body;
        const updatedDokter = await dokterModel.updateDokter(id, dokterData);

        res.json({
            success: true,
            data: updatedDokter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteDokter = async (req, res) => {
    try {
        const { id } = req.params;
        await dokterModel.deleteDokter(id);

        res.json({
            success: true,
            message: 'Dokter berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllDokter,
    getDokterById,
    createDokter,
    updateDokter,
    deleteDokter
};