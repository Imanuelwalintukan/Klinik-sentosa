// paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rute untuk metode pembayaran
router.get('/metode-pembayaran', protect, authorize('admin', 'apoteker'), paymentController.getAllPaymentMethods);
router.get('/metode-pembayaran/:id', protect, authorize('admin', 'apoteker'), paymentController.getPaymentMethodById);
router.post('/metode-pembayaran', protect, authorize('admin'), paymentController.createPaymentMethod);
router.put('/metode-pembayaran/:id', protect, authorize('admin'), paymentController.updatePaymentMethod);
router.delete('/metode-pembayaran/:id', protect, authorize('admin'), paymentController.deletePaymentMethod);

// Rute untuk pembayaran
router.get('/pembayaran', protect, authorize('admin', 'apoteker'), paymentController.getAllPayments);
router.get('/pembayaran/:id', protect, authorize('admin', 'apoteker'), paymentController.getPaymentById);
router.post('/pembayaran', protect, authorize('apoteker'), paymentController.createPayment);
router.put('/pembayaran/:id', protect, authorize('admin', 'apoteker'), paymentController.updatePayment);

module.exports = router;