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
exports.deleteDrug = exports.updateDrug = exports.createDrug = exports.getDrugById = exports.getAllDrugs = void 0;
const client_1 = require("@prisma/client");
const activity_log_service_1 = require("./activity-log.service");
const prisma = new client_1.PrismaClient();
const getAllDrugs = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = '') {
    return prisma.drug.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { sku: { contains: query, mode: 'insensitive' } },
            ],
            deletedAt: null, // Only return non-deleted drugs
        },
        orderBy: { name: 'asc' },
    });
});
exports.getAllDrugs = getAllDrugs;
const getDrugById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const drug = yield prisma.drug.findUnique({ where: { id, deletedAt: null } }); // Only return non-deleted drug
    if (!drug)
        throw new Error('Drug not found');
    return drug;
});
exports.getDrugById = getDrugById;
const createDrug = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const existing = yield prisma.drug.findUnique({ where: { sku: data.sku } });
    if (existing)
        throw new Error('Drug with this SKU already exists');
    const newDrug = yield prisma.drug.create({ data });
    yield (0, activity_log_service_1.logActivity)(req, 'CREATE', 'DRUG', newDrug.id, null, newDrug);
    return newDrug;
});
exports.createDrug = createDrug;
const updateDrug = (id, data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldDrug = yield prisma.drug.findUnique({ where: { id } });
    if (!oldDrug)
        throw new Error('Drug not found');
    if (data.sku && data.sku !== oldDrug.sku) {
        const existing = yield prisma.drug.findUnique({ where: { sku: data.sku } });
        if (existing)
            throw new Error('SKU already in use');
    }
    const updatedDrug = yield prisma.drug.update({ where: { id }, data });
    yield (0, activity_log_service_1.logActivity)(req, 'UPDATE', 'DRUG', id, oldDrug, updatedDrug);
    return updatedDrug;
});
exports.updateDrug = updateDrug;
const deleteDrug = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldDrug = yield prisma.drug.findUnique({ where: { id } });
    if (!oldDrug)
        throw new Error('Drug not found');
    const deletedDrug = yield prisma.drug.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'DELETE', 'DRUG', id, oldDrug, deletedDrug);
    return deletedDrug;
});
exports.deleteDrug = deleteDrug;
