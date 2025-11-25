"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePrescriptionStatusValidation = exports.createPrescriptionSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createPrescriptionSchema = zod_1.z.object({
    medicalRecordId: zod_1.z.number().int().positive(),
    items: zod_1.z.array(zod_1.z.object({
        drugId: zod_1.z.number().int().positive(),
        qty: zod_1.z.number().int().positive(),
        dosageInstructions: zod_1.z.string().optional(),
    })).min(1, 'At least one drug is required'),
});
exports.updatePrescriptionStatusValidation = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.PrescriptionStatus),
});
