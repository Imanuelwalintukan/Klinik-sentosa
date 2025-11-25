import { z } from 'zod';
import { PrescriptionStatus } from '@prisma/client';

export const createPrescriptionSchema = z.object({
    medicalRecordId: z.number().int().positive(),
    items: z.array(z.object({
        drugId: z.number().int().positive(),
        qty: z.number().int().positive(),
        dosageInstructions: z.string().optional(),
    })).min(1, 'At least one drug is required'),
});

export const updatePrescriptionStatusValidation = z.object({
    status: z.nativeEnum(PrescriptionStatus),
});
