import { Request, Response } from 'express';
import { login } from '../services/auth.service';
import { sendResponse } from '../utils/response';
import { loginSchema } from '../validation/auth.validation';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from '../services/activity-log.service';

export const loginController = async (req: Request, res: Response) => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return sendResponse(res, 400, false, null, validation.error.issues[0].message);
        }

        const { email, password } = validation.data;
        const ipAddress = req.ip || '127.0.0.1'; // Fallback for req.ip
        const userAgent = req.headers['user-agent'] || 'Unknown';

        const result = await login(email, password, ipAddress, userAgent);

        // Log activity for successful login
        await logActivity(req as AuthRequest, 'LOGIN', 'USER', result.user.id, null, result.user);

        sendResponse(res, 200, true, result);
    } catch (error: any) {
        sendResponse(res, 401, false, null, error.message);
    }
};
