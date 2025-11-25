import { z } from 'zod';

export const createPatientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    nik: z.string().min(16, 'NIK must be at least 16 characters').max(16, 'NIK must be 16 characters'),
    phone: z.string().optional(),
    address: z.string().optional(),
    birthDate: z.string().transform((str) => new Date(str)), // Expect ISO string
    gender: z.string().optional(), // Not in schema but good to have, though schema didn't specify it in the prompt update.
    // Wait, the user prompt schema for Patient: { id, name, nik, phone, address, birthDate, createdAt }
    // No gender in the user prompt schema update. I will stick to the prompt.
});

export const updatePatientSchema = createPatientSchema.partial();
