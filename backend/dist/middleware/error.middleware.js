"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'ValidationError') {
        return (0, response_1.sendResponse)(res, 400, false, null, err.message);
    }
    if (err.name === 'UnauthorizedError') {
        return (0, response_1.sendResponse)(res, 401, false, null, 'Unauthorized');
    }
    return (0, response_1.sendResponse)(res, 500, false, null, 'Internal Server Error');
};
exports.errorHandler = errorHandler;
