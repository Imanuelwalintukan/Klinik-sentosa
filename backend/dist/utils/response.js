"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, statusCode, success, data = null, error = null) => {
    res.status(statusCode).json({
        success,
        data,
        error,
    });
};
exports.sendResponse = sendResponse;
