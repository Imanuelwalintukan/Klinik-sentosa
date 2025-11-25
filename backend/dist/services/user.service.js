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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserActivation = exports.changeUserRole = exports.restoreUser = exports.changePassword = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const activity_log_service_1 = require("./activity-log.service");
const prisma = new client_1.PrismaClient();
const getAllUsers = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, role, isActive, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (role) {
        where.role = role;
    }
    if (isActive !== undefined) {
        where.isActive = isActive;
    }
    const users = yield prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
            patient: true,
            loginHistory: {
                orderBy: {
                    timestamp: 'desc',
                },
                take: 1,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    const total = yield prisma.user.count({ where });
    return users;
});
exports.getAllUsers = getAllUsers;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.findUnique({
        where: { id },
        include: {
            loginHistory: {
                orderBy: {
                    timestamp: 'desc',
                },
            },
        },
    });
});
exports.getUserById = getUserById;
const createUser = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const { name, email, password, role } = data;
    const passwordHash = yield bcryptjs_1.default.hash(password, 10);
    const newUser = yield prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role,
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'CREATE', 'USER', newUser.id, null, newUser);
    return newUser;
});
exports.createUser = createUser;
const updateUser = (id, data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldUser = yield prisma.user.findUnique({ where: { id } });
    const updatedUser = yield prisma.user.update({
        where: { id },
        data,
    });
    yield (0, activity_log_service_1.logActivity)(req, 'UPDATE', 'USER', id, oldUser, updatedUser);
    return updatedUser;
});
exports.updateUser = updateUser;
const deleteUser = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldUser = yield prisma.user.findUnique({ where: { id } });
    const deletedUser = yield prisma.user.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            isActive: false,
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'DELETE', 'USER', id, oldUser, deletedUser);
    return deletedUser;
});
exports.deleteUser = deleteUser;
const changePassword = (id, password, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const passwordHash = yield bcryptjs_1.default.hash(password, 10);
    const oldUser = yield prisma.user.findUnique({ where: { id } });
    const updatedUser = yield prisma.user.update({
        where: { id },
        data: {
            passwordHash,
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'UPDATE', 'USER', id, { passwordHash: 'OLD_HASH' }, { passwordHash: 'NEW_HASH' });
    return updatedUser;
});
exports.changePassword = changePassword;
const restoreUser = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const user = yield prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error('User not found');
    }
    const restoredUser = yield prisma.user.update({
        where: { id },
        data: {
            deletedAt: null,
            isActive: true,
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'RESTORE', 'USER', id, user, restoredUser);
    return restoredUser;
});
exports.restoreUser = restoreUser;
const changeUserRole = (id, role, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldUser = yield prisma.user.findUnique({ where: { id } });
    if (!oldUser) {
        throw new Error('User not found');
    }
    const updatedUser = yield prisma.user.update({
        where: { id },
        data: { role },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'CHANGE_ROLE', 'USER', id, oldUser, updatedUser);
    return updatedUser;
});
exports.changeUserRole = changeUserRole;
const toggleUserActivation = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldUser = yield prisma.user.findUnique({ where: { id } });
    if (!oldUser) {
        throw new Error('User not found');
    }
    const updatedUser = yield prisma.user.update({
        where: { id },
        data: { isActive: !oldUser.isActive },
    });
    yield (0, activity_log_service_1.logActivity)(req, oldUser.isActive ? 'DEACTIVATE' : 'ACTIVATE', 'USER', id, oldUser, updatedUser);
    return updatedUser;
});
exports.toggleUserActivation = toggleUserActivation;
