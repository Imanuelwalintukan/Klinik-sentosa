import { Router } from 'express';
import * as medicalRecordController from '../controllers/medical-record.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';
import { validate } from '../middleware/validate.middleware'; // Use custom validate
import { createMedicalRecordSchema, updateMedicalRecordSchema } from '../validation/medical-record.validation';

const router = Router();

router.use(authenticate);

router.post('/', authorize([Role.DOCTOR]), validate(createMedicalRecordSchema), medicalRecordController.createMedicalRecord);
router.get('/appointment/:appointmentId', medicalRecordController.getMedicalRecord);
router.put('/appointment/:appointmentId', authorize([Role.ADMIN, Role.DOCTOR]), validate(updateMedicalRecordSchema), medicalRecordController.updateMedicalRecord);

export default router;
