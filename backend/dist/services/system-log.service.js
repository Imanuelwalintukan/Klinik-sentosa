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
exports.getAllActivityLogs = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllActivityLogs = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, userId, entity, action } = query;
    const offset = (page - 1) * limit;
    const where = {};
    if (userId) {
        where.userId = parseInt(userId);
    }
    if (entity) {
        where.entity = entity;
    }
    if (action) {
        where.action = action;
    }
    const activityLogs = yield prisma.activityLog.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        orderBy: {
            timestamp: 'desc',
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    const total = yield prisma.activityLog.count({ where });
    return {
        activityLogs,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
    };
});
exports.getAllActivityLogs = getAllActivityLogs;
