import { Router } from 'express';
import * as patientController from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatient);
router.post('/', authorize([Role.ADMIN, Role.STAFF]), patientController.createPatient);
router.put('/:id', authorize([Role.ADMIN, Role.STAFF]), patientController.updatePatient);
router.delete('/:id', authorize([Role.ADMIN]), patientController.deletePatient);

export default router;
