"use strict";
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
exports.getDashboard = void 0;
const admin_dashboard_service_1 = require("../services/admin-dashboard.service");
const response_1 = require("../utils/response");
const getDashboard = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, admin_dashboard_service_1.getAdminDashboardSummary)();
        (0, response_1.sendResponse)(res, 200, true, data);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getDashboard = getDashboard;
