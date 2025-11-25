import { Request, Response } from 'express';
import * as medicalRecordService from '../services/medical-record.service';
import { sendResponse } from '../utils/response';
import { createMedicalRecordSchema, updateMedicalRecordSchema } from '../validation/medical-record.validation';
import { AuthRequest } from '../middleware/auth.middleware';

export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
    try {
        const validation = createMedicalRecordSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const record = await medicalRecordService.createMedicalRecord(validation.data, req);
        sendResponse(res, 201, true, record);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

export const getMedicalRecord = async (req: Request, res: Response) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        const record = await medicalRecordService.getMedicalRecordByAppointmentId(appointmentId);
        if (!record) return sendResponse(res, 404, false, null, 'Medical record not found');
        sendResponse(res, 200, true, record);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateMedicalRecord = async (req: AuthRequest, res: Response) => {
    try {
        const appointmentId = parseInt(req.params.appointmentId);
        const validation = updateMedicalRecordSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const record = await medicalRecordService.updateMedicalRecord(appointmentId, validation.data, req);
        sendResponse(res, 200, true, record);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

