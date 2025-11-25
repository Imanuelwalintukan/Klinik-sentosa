import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';

const prisma = new PrismaClient();

export const getAllDoctors = async (filters: { search?: string, page?: number, limit?: number }) => {
    const { search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
        deletedAt: null, // Always filter out soft-deleted doctors
    };

    if (search) {
        where.OR = [
            {
                user: {
                    name: { contains: search, mode: 'insensitive' },
                },
            },
            {
                user: {
                    email: { contains: search, mode: 'insensitive' },
                },
            },
            { specialization: { contains: search, mode: 'insensitive' } },
        ];
    }

    const doctors = await prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        include: {
            user: true,
        },
        orderBy: {
            user: {
                name: 'asc' // Order by doctor's name
            },
        },
    });

    const total = await prisma.doctor.count({ where });

    return { doctors, total, page, limit };
};

export const getDoctorById = async (id: number) => {
    return await prisma.doctor.findUnique({
        where: { id },
        include: {
            user: true,
            appointments: true,
        },
    });
};

export const createDoctor = async (data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const { userId, specialization, sip, schedule } = data;

    const newDoctor = await prisma.doctor.create({
        data: {
            userId,
            specialization,
            sip,
            schedule,
        },
    });

    await logActivity(req, 'CREATE', 'DOCTOR', newDoctor.id, null, newDoctor);

    return newDoctor;
};

export const updateDoctor = async (id: number, data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldDoctor = await prisma.doctor.findUnique({ where: { id } });
    const updatedDoctor = await prisma.doctor.update({
        where: { id },
        data,
    });

    await logActivity(req, 'UPDATE', 'DOCTOR', id, oldDoctor, updatedDoctor);

    return updatedDoctor;
};

export const deleteDoctor = async (id: number, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldDoctor = await prisma.doctor.findUnique({ where: { id } });
    const deletedDoctor = await prisma.doctor.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });

    await logActivity(req, 'DELETE', 'DOCTOR', id, oldDoctor, deletedDoctor);

    return deletedDoctor;
};
