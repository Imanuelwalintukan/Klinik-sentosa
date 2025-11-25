import { z } from 'zod';

export const createDrugSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().min(1, 'SKU is required'),
    unitPrice: z.number().min(0, 'Price must be positive'),
    stockQty: z.number().int().min(0, 'Stock must be non-negative'),
    expiryDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
});

export const updateDrugSchema = createDrugSchema.partial();
