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
exports.getStockSummary = exports.logStockChange = exports.getStockAuditLogs = exports.getExpiringDrugs = exports.getLowStockDrugs = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get low stock drugs
const getLowStockDrugs = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.drug.findMany({
        where: {
            deletedAt: null,
            AND: [
                { minStock: { not: null } },
                {
                    stockQty: {
                        lte: prisma.drug.fields.minStock,
                    },
                },
            ],
        },
        orderBy: { stockQty: 'asc' },
    });
});
exports.getLowStockDrugs = getLowStockDrugs;
// Get expiring drugs (within specified days)
const getExpiringDrugs = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return prisma.drug.findMany({
        where: {
            deletedAt: null,
            expiryDate: {
                lte: futureDate,
                gte: new Date(),
            },
        },
        orderBy: { expiryDate: 'asc' },
    });
});
exports.getExpiringDrugs = getExpiringDrugs;
// Get stock audit logs
const getStockAuditLogs = (drugId_1, ...args_1) => __awaiter(void 0, [drugId_1, ...args_1], void 0, function* (drugId, limit = 50) {
    const where = {};
    if (drugId) {
        where.drugId = drugId;
    }
    return prisma.stockAuditLog.findMany({
        where,
        include: {
            drug: true,
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
    });
});
exports.getStockAuditLogs = getStockAuditLogs;
// Log stock change
const logStockChange = (drugId, action, quantity, oldStock, newStock, userId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.stockAuditLog.create({
        data: {
            drugId,
            action,
            quantity,
            oldStock,
            newStock,
            userId,
            reason,
        },
    });
});
exports.logStockChange = logStockChange;
// Get stock summary
const getStockSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalDrugs = yield prisma.drug.count({ where: { deletedAt: null } });
    const lowStockDrugs = yield (0, exports.getLowStockDrugs)();
    const expiringDrugs = yield (0, exports.getExpiringDrugs)(30);
    const totalValue = yield prisma.drug.aggregate({
        where: { deletedAt: null },
        _sum: {
            stockQty: true,
        },
    });
    return {
        totalDrugs,
        lowStockCount: lowStockDrugs.length,
        expiringCount: expiringDrugs.length,
        totalStockQuantity: totalValue._sum.stockQty || 0,
        lowStockDrugs: lowStockDrugs.slice(0, 10), // Top 10
        expiringDrugs: expiringDrugs.slice(0, 10), // Top 10
    };
});
exports.getStockSummary = getStockSummary;
