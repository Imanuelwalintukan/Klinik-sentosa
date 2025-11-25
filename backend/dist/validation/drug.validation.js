"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDrugSchema = exports.createDrugSchema = void 0;
const zod_1 = require("zod");
exports.createDrugSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    sku: zod_1.z.string().min(1, 'SKU is required'),
    unitPrice: zod_1.z.number().min(0, 'Price must be positive'),
    stockQty: zod_1.z.number().int().min(0, 'Stock must be non-negative'),
    expiryDate: zod_1.z.string().optional().transform((str) => str ? new Date(str) : undefined),
});
exports.updateDrugSchema = exports.createDrugSchema.partial();
