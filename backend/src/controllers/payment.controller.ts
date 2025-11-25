import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import { sendResponse } from '../utils/response';
import { createPaymentSchema, updatePaymentStatusValidation } from '../validation/payment.validation';
import { AuthRequest } from '../middleware/auth.middleware';

export const createPayment = async (req: AuthRequest, res: Response) => {
    try {
        const validation = createPaymentSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const payment = await paymentService.createPayment(validation.data, req);
        sendResponse(res, 201, true, payment);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

export const getPayments = async (req: Request, res: Response) => {
    try {
        const payments = await paymentService.getPayments();
        sendResponse(res, 200, true, payments);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        const validation = updatePaymentStatusValidation.safeParse(req.body); // Use zod safeParse
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const { status } = validation.data; // Get data from validation.data
        const updatedPayment = await paymentService.updatePaymentStatus(appointmentId, status, req);
        sendResponse(res, 200, true, updatedPayment);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};
