import { z } from 'zod';

export const createDoctorValidation = z.object({
    userId: z.number().int().positive(),
    specialization: z.string(),
    sip: z.string(),
    schedule: z.string(),
});

export const updateDoctorValidation = z.object({
    specialization: z.string().optional(),
    sip: z.string().optional(),
    schedule: z.string().optional(),
});
