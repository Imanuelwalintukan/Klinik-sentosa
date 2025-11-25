import { Response } from 'express';

export const sendResponse = (
    res: Response,
    statusCode: number,
    success: boolean,
    data: any = null,
    error: string | null = null
) => {
    res.status(statusCode).json({
        success,
        data,
        error,
    });
};
