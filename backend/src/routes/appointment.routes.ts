import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod'; // Import z from zod
import { createAppointmentSchema, updateAppointmentSchema } from '../validation/appointment.validation';

const router = Router();

router.use(authenticate);

const reassignDoctorValidation = z.object({
    newDoctorId: z.number().int().positive(),
});

router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointment);
router.post('/', authorize([Role.ADMIN, Role.STAFF]), validate(createAppointmentSchema), appointmentController.createAppointment);
router.put('/:id', authorize([Role.ADMIN, Role.STAFF, Role.DOCTOR]), validate(updateAppointmentSchema), appointmentController.updateAppointment);
router.post('/:id/cancel', authorize([Role.ADMIN, Role.STAFF]), appointmentController.cancelAppointment);
router.put('/:id/reassign-doctor', authorize([Role.ADMIN, Role.STAFF]), validate(reassignDoctorValidation), appointmentController.reassignDoctor);

export default router;
