"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrescriptionSchema = void 0;
const zod_1 = require("zod");
exports.createPrescriptionSchema = zod_1.z.object({
    medicalRecordId: zod_1.z.number().int().positive(),
    items: zod_1.z.array(zod_1.z.object({
        drugId: zod_1.z.number().int().positive(),
        qty: zod_1.z.number().int().positive(),
        dosageInstructions: zod_1.z.string().optional(),
    })).min(1, 'At least one drug is required'),
});
