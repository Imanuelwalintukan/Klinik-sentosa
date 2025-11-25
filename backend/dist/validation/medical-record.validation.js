"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMedicalRecordSchema = exports.createMedicalRecordSchema = void 0;
const zod_1 = require("zod");
exports.createMedicalRecordSchema = zod_1.z.object({
    appointmentId: zod_1.z.number().int().positive(),
    diagnosis: zod_1.z.string().min(1, 'Diagnosis is required'),
    notes: zod_1.z.string().optional(),
});
exports.updateMedicalRecordSchema = zod_1.z.object({
    diagnosis: zod_1.z.string().min(1, 'Diagnosis is required').optional(),
    notes: zod_1.z.string().optional(),
});
