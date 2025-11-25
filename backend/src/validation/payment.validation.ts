import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';

export const createPaymentSchema = z.object({
    appointmentId: z.number().int().positive().optional(),
    prescriptionId: z.number().int().positive().optional(),
    amount: z.number().positive(),
    method: z.enum(['CASH', 'CARD', 'QRIS']),
}).refine(data => (data.appointmentId || data.prescriptionId) && !(data.appointmentId && data.prescriptionId), {
    message: "Either 'appointmentId' or 'prescriptionId' must be provided, but not both.",
    path: ["appointmentId", "prescriptionId"],
});

export const updatePaymentStatusValidation = z.object({
    status: z.nativeEnum(PaymentStatus),
});
