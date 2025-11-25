import { Router } from 'express';
import * as prescriptionController from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';
import { validate } from '../middleware/validate.middleware'; // Use custom validate
import { createPrescriptionSchema, updatePrescriptionStatusValidation } from '../validation/prescription.validation';

const router = Router();

router.use(authenticate);

router.post('/', authorize([Role.DOCTOR]), validate(createPrescriptionSchema), prescriptionController.createPrescription);
router.get('/', authorize([Role.ADMIN, Role.PHARMACIST, Role.DOCTOR]), prescriptionController.getPrescriptions);
router.get('/:id', authorize([Role.ADMIN, Role.PHARMACIST, Role.DOCTOR]), prescriptionController.getPrescription);
router.put('/:id/status', authorize([Role.ADMIN, Role.PHARMACIST]), validate(updatePrescriptionStatusValidation), prescriptionController.updatePrescriptionStatus);

export default router;
