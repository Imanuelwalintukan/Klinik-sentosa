// Controller untuk modul resep
const resepModel = require('../models/Resep');

const getAllResep = async (req, res) => {
    try {
        const reseps = await resepModel.getAllResep();
        res.json({
            success: true,
            data: reseps
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getResepById = async (req, res) => {
    try {
        const { id } = req.params;
        const resep = await resepModel.getResepById(id);

        if (!resep) {
            return res.status(404).json({
                success: false,
                message: 'Resep tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: resep
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getResepByPemeriksaanId = async (req, res) => {
    try {
        const { pemeriksaanId } = req.params;
        const reseps = await resepModel.getResepByPemeriksaanId(pemeriksaanId);

        res.json({
            success: true,
            data: reseps
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createResep = async (req, res) => {
    try {
        const resepData = req.body;
        const newResep = await resepModel.createResep(resepData);

        res.status(201).json({
            success: true,
            data: newResep
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateResep = async (req, res) => {
    try {
        const { id } = req.params;
        const resepData = req.body;
        const updatedResep = await resepModel.updateResep(id, resepData);

        res.json({
            success: true,
            data: updatedResep
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteResep = async (req, res) => {
    try {
        const { id } = req.params;
        await resepModel.deleteResep(id);

        res.json({
            success: true,
            message: 'Resep berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllResep,
    getResepById,
    getResepByPemeriksaanId,
    createResep,
    updateResep,
    deleteResep
};