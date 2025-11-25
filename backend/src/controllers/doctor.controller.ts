import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import * as doctorService from '../services/doctor.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllDoctors = async (req: Request, res: Response) => {
    try {
        const { search, page, limit } = req.query;

        const filters = {
            search: search ? String(search) : undefined,
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
        };

        const doctors = await doctorService.getAllDoctors(filters);
        sendResponse(res, 200, true, doctors);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getDoctorById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const doctor = await doctorService.getDoctorById(id);
        if (!doctor) {
            return sendResponse(res, 404, false, null, 'Doctor not found');
        }
        sendResponse(res, 200, true, doctor);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const createDoctor = async (req: AuthRequest, res: Response) => {
    try {
        const newDoctor = await doctorService.createDoctor(req.body, req);
        sendResponse(res, 201, true, newDoctor);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateDoctor = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const updatedDoctor = await doctorService.updateDoctor(id, req.body, req);
        sendResponse(res, 200, true, updatedDoctor);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const deleteDoctor = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const deletedDoctor = await doctorService.deleteDoctor(id, req);
        sendResponse(res, 200, true, deletedDoctor);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};
