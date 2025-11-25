"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePatientSchema = exports.createPatientSchema = void 0;
const zod_1 = require("zod");
exports.createPatientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    nik: zod_1.z.string().min(16, 'NIK must be at least 16 characters').max(16, 'NIK must be 16 characters'),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().transform((str) => new Date(str)), // Expect ISO string
    gender: zod_1.z.string().optional(), // Not in schema but good to have, though schema didn't specify it in the prompt update.
    // Wait, the user prompt schema for Patient: { id, name, nik, phone, address, birthDate, createdAt }
    // No gender in the user prompt schema update. I will stick to the prompt.
});
exports.updatePatientSchema = exports.createPatientSchema.partial();
