import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const logActivity = async (
    req: AuthRequest,
    action: string,
    entity: string,
    entityId: number,
    oldValue: any,
    newValue: any
) => {
    if (!req.user) {
        return;
    }

    await prisma.activityLog.create({
        data: {
            userId: req.user.id,
            action,
            entity,
            entityId,
            oldValue,
            newValue,
        },
    });
};
