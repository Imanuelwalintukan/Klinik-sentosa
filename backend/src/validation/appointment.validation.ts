import { z } from 'zod';

export const createAppointmentSchema = z.object({
    patientId: z.number().int().positive(),
    doctorId: z.number().int().positive(),
    scheduledAt: z.string().transform((str) => new Date(str)),
    complaint: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PATIENT_ARRIVED', 'COMPLETED', 'CANCELLED']).optional(),
    scheduledAt: z.string().transform((str) => new Date(str)).optional(),
    complaint: z.string().optional(),
});
