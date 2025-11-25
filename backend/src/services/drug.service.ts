import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';

const prisma = new PrismaClient();

export const getAllDrugs = async (query: string = '') => {
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
};

export const getDrugById = async (id: number) => {
    const drug = await prisma.drug.findUnique({ where: { id, deletedAt: null } }); // Only return non-deleted drug
    if (!drug) throw new Error('Drug not found');
    return drug;
};

export const createDrug = async (data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const existing = await prisma.drug.findUnique({ where: { sku: data.sku } });
    if (existing) throw new Error('Drug with this SKU already exists');

    const newDrug = await prisma.drug.create({ data });

    await logActivity(req, 'CREATE', 'DRUG', newDrug.id, null, newDrug);

    return newDrug;
};

export const updateDrug = async (id: number, data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldDrug = await prisma.drug.findUnique({ where: { id } });
    if (!oldDrug) throw new Error('Drug not found');

    if (data.sku && data.sku !== oldDrug.sku) {
        const existing = await prisma.drug.findUnique({ where: { sku: data.sku } });
        if (existing) throw new Error('SKU already in use');
    }

    const updatedDrug = await prisma.drug.update({ where: { id }, data });

    await logActivity(req, 'UPDATE', 'DRUG', id, oldDrug, updatedDrug);

    return updatedDrug;
};

export const deleteDrug = async (id: number, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldDrug = await prisma.drug.findUnique({ where: { id } });
    if (!oldDrug) throw new Error('Drug not found');

    const deletedDrug = await prisma.drug.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });

    await logActivity(req, 'DELETE', 'DRUG', id, oldDrug, deletedDrug);

    return deletedDrug;
};
