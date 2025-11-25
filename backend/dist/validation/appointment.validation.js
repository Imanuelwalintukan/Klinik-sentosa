"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentSchema = exports.createAppointmentSchema = void 0;
const zod_1 = require("zod");
exports.createAppointmentSchema = zod_1.z.object({
    patientId: zod_1.z.number().int().positive(),
    doctorId: zod_1.z.number().int().positive(),
    scheduledAt: zod_1.z.string().transform((str) => new Date(str)),
    complaint: zod_1.z.string().optional(),
});
exports.updateAppointmentSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
    scheduledAt: zod_1.z.string().transform((str) => new Date(str)).optional(),
    complaint: zod_1.z.string().optional(),
});
