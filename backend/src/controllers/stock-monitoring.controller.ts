import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import * as stockMonitoringService from '../services/stock-monitoring.service';

export const getLowStockDrugs = async (req: Request, res: Response) => {
    try {
        const drugs = await stockMonitoringService.getLowStockDrugs();
        sendResponse(res, 200, true, drugs);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getExpiringDrugs = async (req: Request, res: Response) => {
    try {
        const { days } = req.query;
        const drugs = await stockMonitoringService.getExpiringDrugs(
            days ? parseInt(String(days)) : 30
        );
        sendResponse(res, 200, true, drugs);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getStockAuditLogs = async (req: Request, res: Response) => {
    try {
        const { drugId, limit } = req.query;
        const logs = await stockMonitoringService.getStockAuditLogs(
            drugId ? parseInt(String(drugId)) : undefined,
            limit ? parseInt(String(limit)) : 50
        );
        sendResponse(res, 200, true, logs);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getStockSummary = async (req: Request, res: Response) => {
    try {
        const summary = await stockMonitoringService.getStockSummary();
        sendResponse(res, 200, true, summary);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};
