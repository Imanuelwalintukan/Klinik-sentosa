import { Request, Response } from 'express';
import * as drugService from '../services/drug.service';
import { sendResponse } from '../utils/response';
import { createDrugSchema, updateDrugSchema } from '../validation/drug.validation';
import { AuthRequest } from '../middleware/auth.middleware';

export const getDrugs = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        const drugs = await drugService.getAllDrugs(query);
        sendResponse(res, 200, true, drugs);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getDrug = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const drug = await drugService.getDrugById(id);
        sendResponse(res, 200, true, drug);
    } catch (error: any) {
        sendResponse(res, 404, false, null, error.message);
    }
};

export const createDrug = async (req: AuthRequest, res: Response) => {
    try {
        const validation = createDrugSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const drug = await drugService.createDrug(validation.data, req);
        sendResponse(res, 201, true, drug);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

export const updateDrug = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const validation = updateDrugSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const drug = await drugService.updateDrug(id, validation.data, req);
        sendResponse(res, 200, true, drug);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

export const deleteDrug = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await drugService.deleteDrug(id, req);
        sendResponse(res, 200, true, null);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};
