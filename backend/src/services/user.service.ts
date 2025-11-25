import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';

const prisma = new PrismaClient();

export const getAllUsers = async (filters: { search?: string, role?: string, isActive?: boolean, page?: number, limit?: number }) => {
    const { search, role, isActive, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (role) {
        where.role = role;
    }
    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    const users = await prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
            patient: true,
            loginHistory: {
                orderBy: {
                    timestamp: 'desc',
                },
                take: 1,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const total = await prisma.user.count({ where });

    return users;
};

export const getUserById = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            loginHistory: {
                orderBy: {
                    timestamp: 'desc',
                },
            },
        },
    });
};

export const createUser = async (data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const { name, email, password, role } = data;
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role,
        },
    });

    await logActivity(req, 'CREATE', 'USER', newUser.id, null, newUser);

    return newUser;
};

export const updateUser = async (id: number, data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldUser = await prisma.user.findUnique({ where: { id } });
    const updatedUser = await prisma.user.update({
        where: { id },
        data,
    });

    await logActivity(req, 'UPDATE', 'USER', id, oldUser, updatedUser);

    return updatedUser;
};

export const deleteUser = async (id: number, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldUser = await prisma.user.findUnique({ where: { id } });
    const deletedUser = await prisma.user.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            isActive: false,
        },
    });

    await logActivity(req, 'DELETE', 'USER', id, oldUser, deletedUser);

    return deletedUser;
};

export const changePassword = async (id: number, password: string, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const oldUser = await prisma.user.findUnique({ where: { id } });
    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            passwordHash,
        },
    });

    await logActivity(req, 'UPDATE', 'USER', id, { passwordHash: 'OLD_HASH' }, { passwordHash: 'NEW_HASH' });

    return updatedUser;
};

export const restoreUser = async (id: number, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error('User not found');
    }

    const restoredUser = await prisma.user.update({
        where: { id },
        data: {
            deletedAt: null,
            isActive: true,
        },
    });

    await logActivity(req, 'RESTORE', 'USER', id, user, restoredUser);
    return restoredUser;
};

