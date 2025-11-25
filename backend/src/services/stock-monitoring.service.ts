import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get low stock drugs
export const getLowStockDrugs = async () => {
    // Use raw query since Prisma doesn't support column-to-column comparison directly
    return prisma.$queryRaw`
        SELECT * FROM "Drug"
        WHERE "deletedAt" IS NULL
        AND "minStock" IS NOT NULL
        AND "stockQty" <= "minStock"
        ORDER BY "stockQty" ASC
    `;
};

// Get expiring drugs (within specified days)
export const getExpiringDrugs = async (days: number = 30) => {
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
};

// Get stock audit logs
export const getStockAuditLogs = async (drugId?: number, limit: number = 50) => {
    const where: any = {};
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
};

// Log stock change
export const logStockChange = async (
    drugId: number,
    action: string,
    quantity: number,
    oldStock: number,
    newStock: number,
    userId: number,
    reason?: string
) => {
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
};

// Get stock summary
export const getStockSummary = async () => {
    const totalDrugs = await prisma.drug.count({ where: { deletedAt: null } });
    const lowStockDrugs = await getLowStockDrugs() as any[]; // Type assertion for raw query
    const expiringDrugs = await getExpiringDrugs(30);

    const totalValue = await prisma.drug.aggregate({
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
};
