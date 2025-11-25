"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusValidation = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createPaymentSchema = zod_1.z.object({
    appointmentId: zod_1.z.number().int().positive().optional(),
    prescriptionId: zod_1.z.number().int().positive().optional(),
    amount: zod_1.z.number().positive(),
    method: zod_1.z.enum(['CASH', 'CARD', 'QRIS']),
}).refine(data => (data.appointmentId || data.prescriptionId) && !(data.appointmentId && data.prescriptionId), {
    message: "Either 'appointmentId' or 'prescriptionId' must be provided, but not both.",
    path: ["appointmentId", "prescriptionId"],
});
exports.updatePaymentStatusValidation = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.PaymentStatus),
});
