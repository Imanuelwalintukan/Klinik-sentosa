import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import * as doctorController from '../controllers/doctor.controller';
import { authenticate, authorize, isAdmin } from '../middleware/auth.middleware';
import {
    createDoctorValidation,
    updateDoctorValidation,
} from '../validation/doctor.validation';
import { Role } from '@prisma/client'; // Import Role

const router = Router();

router.get('/', [authenticate, authorize([Role.ADMIN, Role.STAFF, Role.DOCTOR])], doctorController.getAllDoctors);
router.get('/:id', [authenticate, isAdmin], doctorController.getDoctorById);
router.post('/', [authenticate, isAdmin, validate(createDoctorValidation)], doctorController.createDoctor);
router.put('/:id', [authenticate, isAdmin, validate(updateDoctorValidation)], doctorController.updateDoctor);
router.delete('/:id', [authenticate, isAdmin], doctorController.deleteDoctor);

export default router;
