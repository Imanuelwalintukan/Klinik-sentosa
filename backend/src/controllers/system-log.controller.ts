import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import * as systemLogService from '../services/system-log.service';
import { AuthRequest } from '../middleware/auth.middleware'; // Import AuthRequest

export const getAllActivityLogs = async (req: AuthRequest, res: Response) => { // Change Request to AuthRequest
    try {
        const activityLogs = await systemLogService.getAllActivityLogs(req.query);
        sendResponse(res, 200, true, activityLogs);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};
