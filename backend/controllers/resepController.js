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

const createBulkResep = async (req, res) => {
    try {
        const { examinationId, items } = req.body;
        if (!examinationId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Data resep tidak valid.' });
        }

        const newReseps = await resepModel.createBulkResep(examinationId, items);

        res.status(201).json({
            success: true,
            message: 'Resep bulk berhasil ditambahkan.',
            data: newReseps
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const dispenseResep = async (req, res) => {
    try {
        const { pemeriksaanId } = req.params;
        const result = await resepModel.dispense(pemeriksaanId);
        res.status(200).json(result);
    } catch (error) {
        // Log the specific error message from the model
        console.error(`Dispense error for examination ${req.params.pemeriksaanId}:`, error.message);
        res.status(400).json({
            success: false,
            message: error.message // Send the specific error message to the frontend
        });
    }
};

module.exports = {
    getAllResep,
    getResepById,
    getResepByPemeriksaanId,
    createResep,
    updateResep,
    deleteResep,
    createBulkResep,
    dispenseResep
};