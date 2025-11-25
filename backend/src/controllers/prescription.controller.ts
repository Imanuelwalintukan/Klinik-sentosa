import { Request, Response } from 'express';
import * as prescriptionService from '../services/prescription.service';
import { sendResponse } from '../utils/response';
import { createPrescriptionSchema, updatePrescriptionStatusValidation } from '../validation/prescription.validation';
import { AuthRequest } from '../middleware/auth.middleware';

export const createPrescription = async (req: AuthRequest, res: Response) => {
    try {
        const validation = createPrescriptionSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        if (!req.user) return sendResponse(res, 401, false, null, 'Unauthorized');

        const prescription = await prescriptionService.createPrescription(validation.data, req);
        sendResponse(res, 201, true, prescription);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

export const getPrescriptions = async (req: Request, res: Response) => {
    try {
        const { status } = req.query; // Extract status from query
        const prescriptions = await prescriptionService.getPrescriptions(status as string); // Pass status to service
        sendResponse(res, 200, true, prescriptions);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getPrescription = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const prescription = await prescriptionService.getPrescriptionById(id);
        sendResponse(res, 200, true, prescription);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 404, false, null, error.message);
    }
};

export const updatePrescriptionStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const validation = updatePrescriptionStatusValidation.safeParse(req.body); // Use zod safeParse
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const { status } = validation.data; // Get data from validation.data
        const updatedPrescription = await prescriptionService.updatePrescriptionStatus(id, status, req);
        sendResponse(res, 200, true, updatedPrescription);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};
