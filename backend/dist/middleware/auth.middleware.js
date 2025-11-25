"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../utils/response");
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        return (0, response_1.sendResponse)(res, 401, false, null, 'Access denied. No token provided.');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, 'Invalid token.');
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_1.sendResponse)(res, 401, false, null, 'Unauthorized.');
        }
        if (!roles.includes(req.user.role)) {
            return (0, response_1.sendResponse)(res, 403, false, null, 'Access denied. Insufficient permissions.');
        }
        next();
    };
};
exports.authorize = authorize;
