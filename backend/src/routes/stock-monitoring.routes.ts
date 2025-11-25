import { Router } from 'express';
import * as stockMonitoringController from '../controllers/stock-monitoring.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Admin and Pharmacist can access stock monitoring
router.get(
    '/low-stock',
    [authenticate, authorize([Role.ADMIN, Role.PHARMACIST])],
    stockMonitoringController.getLowStockDrugs
);

router.get(
    '/expiring',
    [authenticate, authorize([Role.ADMIN, Role.PHARMACIST])],
    stockMonitoringController.getExpiringDrugs
);

router.get(
    '/audit-logs',
    [authenticate, authorize([Role.ADMIN, Role.PHARMACIST])],
    stockMonitoringController.getStockAuditLogs
);

router.get(
    '/summary',
    [authenticate, authorize([Role.ADMIN, Role.PHARMACIST])],
    stockMonitoringController.getStockSummary
);

export default router;
