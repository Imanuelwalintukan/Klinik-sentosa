import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Admin/Staff can register customers
router.post(
    '/register',
    [authenticate, authorize([Role.ADMIN, Role.STAFF])],
    customerController.registerCustomer
);

// Customer-only routes
router.get(
    '/profile',
    [authenticate, authorize([Role.CUSTOMER])],
    customerController.getCustomerProfile
);

router.get(
    '/queue',
    [authenticate, authorize([Role.CUSTOMER])],
    customerController.getCustomerQueue
);

router.get(
    '/appointments',
    [authenticate, authorize([Role.CUSTOMER])],
    customerController.getCustomerAppointments
);

router.get(
    '/prescriptions',
    [authenticate, authorize([Role.CUSTOMER])],
    customerController.getCustomerPrescriptions
);

router.get(
    '/payments',
    [authenticate, authorize([Role.CUSTOMER])],
    customerController.getCustomerPayments
);

router.put(
    '/profile',
    [authenticate, authorize([Role.CUSTOMER])],
    customerController.updateCustomerProfile
);

export default router;
