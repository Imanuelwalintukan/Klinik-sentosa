import { Request, Response } from 'express';
import { getAdminDashboardSummary } from '../services/admin-dashboard.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getDashboard = async (_req: AuthRequest, res: Response) => {
    try {
        const data = await getAdminDashboardSummary();
        sendResponse(res, 200, true, data);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};
