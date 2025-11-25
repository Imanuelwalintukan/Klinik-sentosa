// paymentController.js
const paymentModel = require('../models/PaymentModel');
const logger = require('../utils/paymentLogger');

// Controller untuk metode pembayaran
const getAllPaymentMethods = async (req, res) => {
  try {
    console.log('Memanggil getAllPaymentMethods...');
    console.log('User info:', req.user);
    logger.info('Getting all payment methods', { user: req.user?.id, role: req.user?.role });

    const methods = await paymentModel.getAllPaymentMethods();
    console.log('Jumlah metode pembayaran yang ditemukan:', methods.length);
    console.log('Data metode pembayaran:', methods.slice(0, 2)); // Hanya tampilkan 2 item pertama untuk ringkasan

    logger.info('Payment methods retrieved successfully', { count: methods.length });
    res.json({
      success: true,
      data: methods
    });
  } catch (error) {
    console.error('Error di getAllPaymentMethods controller:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    logger.error('Error getting payment methods', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message,
      ...(process.env.NODE_ENV === 'development' && { error: error.message, stack: error.stack })
    });
  }
};

const getPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('Getting payment method by ID', { id, user: req.user?.id });
    const method = await paymentModel.getPaymentMethodById(id);

    if (!method) {
      logger.warn('Payment method not found', { id });
      return res.status(404).json({
        success: false,
        message: 'Metode pembayaran tidak ditemukan'
      });
    }

    logger.info('Payment method retrieved successfully', { id });
    res.json({
      success: true,
      data: method
    });
  } catch (error) {
    logger.error('Error getting payment method by ID', { id, error: error.message });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createPaymentMethod = async (req, res) => {
  try {
    const methodData = req.body;
    logger.info('Creating new payment method', { data: methodData, user: req.user?.id });
    const newMethod = await paymentModel.createPaymentMethod(methodData);

    logger.info('Payment method created successfully', { id: newMethod.id });
    res.status(201).json({
      success: true,
      data: newMethod
    });
  } catch (error) {
    logger.error('Error creating payment method', { error: error.message, data: methodData });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const methodData = req.body;
    logger.info('Updating payment method', { id, data: methodData, user: req.user?.id });
    const updatedMethod = await paymentModel.updatePaymentMethod(id, methodData);

    if (!updatedMethod) {
      logger.warn('Payment method not found for update', { id });
      return res.status(404).json({
        success: false,
        message: 'Metode pembayaran tidak ditemukan'
      });
    }

    logger.info('Payment method updated successfully', { id });
    res.json({
      success: true,
      data: updatedMethod
    });
  } catch (error) {
    logger.error('Error updating payment method', { id, error: error.message });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('Deleting payment method', { id, user: req.user?.id });
    const deletedMethod = await paymentModel.deletePaymentMethod(id);

    if (!deletedMethod) {
      logger.warn('Payment method not found for deletion', { id });
      return res.status(404).json({
        success: false,
        message: 'Metode pembayaran tidak ditemukan'
      });
    }

    logger.info('Payment method deleted successfully', { id });
    res.json({
      success: true,
      message: 'Metode pembayaran berhasil dinonaktifkan',
      data: deletedMethod
    });
  } catch (error) {
    logger.error('Error deleting payment method', { id, error: error.message });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Controller untuk pembayaran
const getAllPayments = async (req, res) => {
  try {
    logger.info('Getting all payments', { user: req.user?.id, role: req.user?.role });
    const payments = await paymentModel.getAllPayments();
    logger.info('Payments retrieved successfully', { count: payments.length });
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    logger.error('Error getting payments', { error: error.message });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('Getting payment by ID', { id, user: req.user?.id });
    const payment = await paymentModel.getPaymentById(id);

    if (!payment) {
      logger.warn('Payment not found', { id });
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan'
      });
    }

    logger.info('Payment retrieved successfully', { id });
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Error getting payment by ID', { id, error: error.message });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createPayment = async (req, res) => {
  try {
    const paymentData = req.body;
    logger.info('Creating new payment', { data: paymentData, user: req.user?.id });
    const newPayment = await paymentModel.createPayment(paymentData);

    logger.info('Payment created successfully', { id: newPayment.id });
    res.status(201).json({
      success: true,
      data: newPayment
    });
  } catch (error) {
    logger.error('Error creating payment', { error: error.message, data: paymentData });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    logger.info('Updating payment', { id, data: paymentData, user: req.user?.id });
    const updatedPayment = await paymentModel.updatePayment(id, paymentData);

    if (!updatedPayment) {
      logger.warn('Payment not found for update', { id });
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan'
      });
    }

    logger.info('Payment updated successfully', { id });
    res.json({
      success: true,
      data: updatedPayment
    });
  } catch (error) {
    logger.error('Error updating payment', { id, error: error.message });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment
};