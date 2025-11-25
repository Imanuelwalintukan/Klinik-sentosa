import { z } from 'zod';

export const createMedicalRecordSchema = z.object({
    appointmentId: z.number().int().positive(),
    diagnosis: z.string().min(1, 'Diagnosis is required'),
    notes: z.string().optional(),
});

export const updateMedicalRecordSchema = z.object({
    diagnosis: z.string().min(1, 'Diagnosis is required').optional(),
    notes: z.string().optional(),
});
