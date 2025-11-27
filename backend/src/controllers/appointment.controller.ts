import { Request, Response } from 'express';
import * as appointmentService from '../services/appointment.service';
import * as doctorService from '../services/doctor.service';
import { sendResponse } from '../utils/response';
import { createAppointmentSchema, updateAppointmentSchema } from '../validation/appointment.validation';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAppointments = async (req: AuthRequest, res: Response) => {
    try {
        const date = req.query.date as string;
        let doctorId = req.query.doctorId ? parseInt(req.query.doctorId as string) : undefined;

        // Enforce doctorId if the user is a DOCTOR
        if (req.user?.role === 'DOCTOR') {
            const doctor = await doctorService.getDoctorByUserId(req.user.id);
            if (doctor) {
                doctorId = doctor.id;
            }
        }

        const appointments = await appointmentService.getAppointments(date, doctorId);
        sendResponse(res, 200, true, appointments);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getAppointment = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const appointment = await appointmentService.getAppointmentById(id);
        sendResponse(res, 200, true, appointment);
    } catch (error: any) {
        sendResponse(res, 404, false, null, error.message);
    }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const validation = createAppointmentSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        if (!req.user) return sendResponse(res, 401, false, null, 'Unauthorized');

        const appointment = await appointmentService.createAppointment(validation.data, req);
        sendResponse(res, 201, true, appointment);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const validation = updateAppointmentSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const appointment = await appointmentService.updateAppointment(id, validation.data, req);
        sendResponse(res, 200, true, appointment);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const cancelledAppointment = await appointmentService.cancelAppointment(id, req);
        sendResponse(res, 200, true, cancelledAppointment);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};

export const reassignDoctor = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { newDoctorId } = req.body;
        const reassignedAppointment = await appointmentService.reassignDoctor(id, newDoctorId, req);
        sendResponse(res, 200, true, reassignedAppointment);
    } catch (error: any) {
        sendResponse(res, 400, false, null, error.message);
    }
};
