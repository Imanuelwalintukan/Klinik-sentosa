import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';
import { validate } from '../middleware/validate.middleware'; // Use custom validate
import { createPaymentSchema, updatePaymentStatusValidation } from '../validation/payment.validation';

const router = Router();

router.use(authenticate);

router.post('/', authorize([Role.ADMIN, Role.STAFF]), validate(createPaymentSchema), paymentController.createPayment);
router.get('/', authorize([Role.ADMIN, Role.STAFF]), paymentController.getPayments);
router.put('/appointment/:appointmentId/status', authorize([Role.ADMIN, Role.STAFF]), validate(updatePaymentStatusValidation), paymentController.updatePaymentStatus);

// Revenue report routes
router.get('/reports/daily', authorize([Role.ADMIN]), paymentController.getDailyRevenue);
router.get('/reports/weekly', authorize([Role.ADMIN]), paymentController.getWeeklyRevenue);
router.get('/reports/monthly', authorize([Role.ADMIN]), paymentController.getMonthlyRevenue);

export default router;
