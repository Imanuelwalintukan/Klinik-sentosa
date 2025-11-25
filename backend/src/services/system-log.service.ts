import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllActivityLogs = async (query: any) => {
    const { page = 1, limit = 10, userId, entity, action } = query;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (userId) {
        where.userId = parseInt(userId);
    }
    if (entity) {
        where.entity = entity;
    }
    if (action) {
        where.action = action;
    }

    const activityLogs = await prisma.activityLog.findMany({
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

    const total = await prisma.activityLog.count({ where });

    return {
        activityLogs,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
    };
};
