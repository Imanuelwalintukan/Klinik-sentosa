import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import * as customerService from '../services/customer.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const registerCustomer = async (req: AuthRequest, res: Response) => {
    try {
        const result = await customerService.registerCustomer(req.body, req);
        sendResponse(res, 201, true, result);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getCustomerProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return sendResponse(res, 401, false, null, 'Not authenticated');
        }
        const profile = await customerService.getCustomerProfile(req.user.id);
        sendResponse(res, 200, true, profile);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getCustomerQueue = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return sendResponse(res, 401, false, null, 'Not authenticated');
        }
        const queue = await customerService.getCustomerQueue(req.user.id);
        sendResponse(res, 200, true, queue);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getCustomerAppointments = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return sendResponse(res, 401, false, null, 'Not authenticated');
        }
        const { status } = req.query;
        const appointments = await customerService.getCustomerAppointments(
            req.user.id,
            status ? String(status) : undefined
        );
        sendResponse(res, 200, true, appointments);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getCustomerPrescriptions = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return sendResponse(res, 401, false, null, 'Not authenticated');
        }
        const prescriptions = await customerService.getCustomerPrescriptions(req.user.id);
        sendResponse(res, 200, true, prescriptions);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getCustomerPayments = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return sendResponse(res, 401, false, null, 'Not authenticated');
        }
        const payments = await customerService.getCustomerPayments(req.user.id);
        sendResponse(res, 200, true, payments);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateCustomerProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return sendResponse(res, 401, false, null, 'Not authenticated');
        }
        const result = await customerService.updateCustomerProfile(req.user.id, req.body, req);
        sendResponse(res, 200, true, result);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};
