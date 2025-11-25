import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sendResponse } from '../utils/response';

export const validate = (schema: z.ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync(req.body);
        next();
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return sendResponse(res, 400, false, null, error.issues[0].message);
        }
        return sendResponse(res, 500, false, null, 'Validation error');
    }
};
