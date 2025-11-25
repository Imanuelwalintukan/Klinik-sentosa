"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockSummary = exports.getStockAuditLogs = exports.getExpiringDrugs = exports.getLowStockDrugs = void 0;
const response_1 = require("../utils/response");
const stockMonitoringService = __importStar(require("../services/stock-monitoring.service"));
const getLowStockDrugs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drugs = yield stockMonitoringService.getLowStockDrugs();
        (0, response_1.sendResponse)(res, 200, true, drugs);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getLowStockDrugs = getLowStockDrugs;
const getExpiringDrugs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { days } = req.query;
        const drugs = yield stockMonitoringService.getExpiringDrugs(days ? parseInt(String(days)) : 30);
        (0, response_1.sendResponse)(res, 200, true, drugs);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getExpiringDrugs = getExpiringDrugs;
const getStockAuditLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { drugId, limit } = req.query;
        const logs = yield stockMonitoringService.getStockAuditLogs(drugId ? parseInt(String(drugId)) : undefined, limit ? parseInt(String(limit)) : 50);
        (0, response_1.sendResponse)(res, 200, true, logs);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getStockAuditLogs = getStockAuditLogs;
const getStockSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summary = yield stockMonitoringService.getStockSummary();
        (0, response_1.sendResponse)(res, 200, true, summary);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getStockSummary = getStockSummary;
