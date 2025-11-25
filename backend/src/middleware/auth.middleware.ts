import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/response';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: Role;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return sendResponse(res, 401, false, null, 'Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded as { id: number; role: Role };
        next();
    } catch (error) {
        sendResponse(res, 400, false, null, 'Invalid token.');
    }
};

export const authorize = (roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return sendResponse(res, 401, false, null, 'Unauthorized.');
        }

        if (!roles.includes(req.user.role)) {
            return sendResponse(res, 403, false, null, 'Access denied. Insufficient permissions.');
        }

        next();
    };
};

export const isAdmin = authorize([Role.ADMIN]);
