"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    prescriptionId: zod_1.z.number().int().positive(),
    amount: zod_1.z.number().positive(),
    method: zod_1.z.enum(['CASH', 'CARD', 'QRIS']),
});
