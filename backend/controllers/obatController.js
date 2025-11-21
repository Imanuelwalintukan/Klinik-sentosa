// Controller untuk modul obat
const obatModel = require('../models/Obat');

const getAllObat = async (req, res) => {
    try {
        const obats = await obatModel.getAllObat();
        res.json({
            success: true,
            data: obats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getObatById = async (req, res) => {
    try {
        const { id } = req.params;
        const obat = await obatModel.getObatById(id);

        if (!obat) {
            return res.status(404).json({
                success: false,
                message: 'Obat tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: obat
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createObat = async (req, res) => {
    try {
        const obatData = req.body;
        const newObat = await obatModel.createObat(obatData);

        res.status(201).json({
            success: true,
            data: newObat
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateObat = async (req, res) => {
    try {
        const { id } = req.params;
        const obatData = req.body;
        const updatedObat = await obatModel.updateObat(id, obatData);

        res.json({
            success: true,
            data: updatedObat
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteObat = async (req, res) => {
    try {
        const { id } = req.params;
        await obatModel.deleteObat(id);

        res.json({
            success: true,
            message: 'Obat berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllObat,
    getObatById,
    createObat,
    updateObat,
    deleteObat
};