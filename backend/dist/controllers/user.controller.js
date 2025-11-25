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
exports.toggleUserActivation = exports.changeUserRole = exports.restoreUser = exports.changePassword = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const response_1 = require("../utils/response");
const userService = __importStar(require("../services/user.service"));
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, role, isActive, page, limit } = req.query;
        const filters = {
            search: search ? String(search) : undefined,
            role: role ? String(role) : undefined,
            isActive: isActive !== undefined ? String(isActive).toLowerCase() === 'true' : undefined,
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
        };
        const users = yield userService.getAllUsers(filters);
        (0, response_1.sendResponse)(res, 200, true, users);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const user = yield userService.getUserById(id);
        if (!user) {
            return (0, response_1.sendResponse)(res, 404, false, null, 'User not found');
        }
        (0, response_1.sendResponse)(res, 200, true, user);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getUserById = getUserById;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUser = yield userService.createUser(req.body, req);
        (0, response_1.sendResponse)(res, 201, true, newUser);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedUser = yield userService.updateUser(id, req.body, req);
        (0, response_1.sendResponse)(res, 200, true, updatedUser);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const deletedUser = yield userService.deleteUser(id, req);
        (0, response_1.sendResponse)(res, 200, true, deletedUser);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.deleteUser = deleteUser;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { password } = req.body;
        const updatedUser = yield userService.changePassword(id, password, req);
        (0, response_1.sendResponse)(res, 200, true, updatedUser);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.changePassword = changePassword;
const restoreUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const restoredUser = yield userService.restoreUser(id, req);
        (0, response_1.sendResponse)(res, 200, true, restoredUser);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.restoreUser = restoreUser;
const changeUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { role } = req.body;
        const updatedUser = yield userService.changeUserRole(id, role, req);
        (0, response_1.sendResponse)(res, 200, true, updatedUser);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.changeUserRole = changeUserRole;
const toggleUserActivation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedUser = yield userService.toggleUserActivation(id, req);
        (0, response_1.sendResponse)(res, 200, true, updatedUser);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.toggleUserActivation = toggleUserActivation;
