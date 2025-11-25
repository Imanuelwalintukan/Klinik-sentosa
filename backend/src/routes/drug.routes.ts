import { Router } from 'express';
import * as drugController from '../controllers/drug.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', drugController.getDrugs);
router.get('/:id', drugController.getDrug);
router.post('/', authorize([Role.ADMIN, Role.PHARMACIST]), drugController.createDrug);
router.put('/:id', authorize([Role.ADMIN, Role.PHARMACIST]), drugController.updateDrug);
router.delete('/:id', authorize([Role.ADMIN]), drugController.deleteDrug);

export default router;
