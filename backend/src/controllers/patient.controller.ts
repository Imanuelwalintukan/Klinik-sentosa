import { Request, Response } from 'express';
import * as patientService from '../services/patient.service';
import { sendResponse } from '../utils/response';
import { createPatientSchema, updatePatientSchema } from '../validation/patient.validation';
import { AuthRequest } from '../middleware/auth.middleware';

export const getPatients = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        const patients = await patientService.getAllPatients(query);
        sendResponse(res, 200, true, patients);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getPatient = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const patient = await patientService.getPatientById(id);
        sendResponse(res, 200, true, patient);
    } catch (error: any) {
        sendResponse(res, 404, false, null, error.message);
    }
};

export const createPatient = async (req: AuthRequest, res: Response) => {
    try {
        const validation = createPatientSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const patient = await patientService.createPatient(validation.data, req);
        sendResponse(res, 201, true, patient);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const validation = updatePatientSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const patient = await patientService.updatePatient(id, validation.data, req);
        sendResponse(res, 200, true, patient);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

export const deletePatient = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await patientService.deletePatient(id, req);
        sendResponse(res, 200, true, null);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};
