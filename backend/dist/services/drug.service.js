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
const prisma = new client_1.PrismaClient();
const getAllDrugs = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = '') {
    return prisma.drug.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { sku: { contains: query, mode: 'insensitive' } },
            ],
        },
        orderBy: { name: 'asc' },
    });
});
exports.getAllDrugs = getAllDrugs;
const getDrugById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const drug = yield prisma.drug.findUnique({ where: { id } });
    if (!drug)
        throw new Error('Drug not found');
    return drug;
});
exports.getDrugById = getDrugById;
const createDrug = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma.drug.findUnique({ where: { sku: data.sku } });
    if (existing)
        throw new Error('Drug with this SKU already exists');
    return prisma.drug.create({ data });
});
exports.createDrug = createDrug;
const updateDrug = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const drug = yield prisma.drug.findUnique({ where: { id } });
    if (!drug)
        throw new Error('Drug not found');
    if (data.sku && data.sku !== drug.sku) {
        const existing = yield prisma.drug.findUnique({ where: { sku: data.sku } });
        if (existing)
            throw new Error('SKU already in use');
    }
    return prisma.drug.update({ where: { id }, data });
});
exports.updateDrug = updateDrug;
const deleteDrug = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.drug.delete({ where: { id } });
});
exports.deleteDrug = deleteDrug;
