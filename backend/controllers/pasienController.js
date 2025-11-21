// Controller untuk modul pasien
const pasienModel = require('../models/Pasien');

const getAllPasien = async (req, res) => {
    try {
        const pasiens = await pasienModel.getAllPasien();
        res.json({
            success: true,
            data: pasiens
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getPasienById = async (req, res) => {
    try {
        const { id } = req.params;
        const pasien = await pasienModel.getPasienById(id);

        if (!pasien) {
            return res.status(404).json({
                success: false,
                message: 'Pasien tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: pasien
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createPasien = async (req, res) => {
    try {
        const pasienData = req.body;
        const newPasien = await pasienModel.createPasien(pasienData);

        res.status(201).json({
            success: true,
            data: newPasien
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updatePasien = async (req, res) => {
    try {
        const { id } = req.params;
        const pasienData = req.body;
        const updatedPasien = await pasienModel.updatePasien(id, pasienData);

        res.json({
            success: true,
            data: updatedPasien
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deletePasien = async (req, res) => {
    try {
        const { id } = req.params;
        await pasienModel.deletePasien(id);

        res.json({
            success: true,
            message: 'Pasien berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllPasien,
    getPasienById,
    createPasien,
    updatePasien,
    deletePasien
};