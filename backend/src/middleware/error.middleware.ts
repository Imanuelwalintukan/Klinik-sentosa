import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
        return sendResponse(res, 400, false, null, err.message);
    }

    if (err.name === 'UnauthorizedError') {
        return sendResponse(res, 401, false, null, 'Unauthorized');
    }

    return sendResponse(res, 500, false, null, 'Internal Server Error');
};
