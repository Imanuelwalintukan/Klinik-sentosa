import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';

const prisma = new PrismaClient();

export const getAllDoctors = async (filters: { search?: string, page?: number, limit?: number }) => {
    const { search, page = 1, limit } = filters;

    // If no limit is provided, return all doctors (for dropdowns, etc.)
    // Otherwise use pagination
    const skip = limit ? (page - 1) * limit : undefined;
    const take = limit || undefined;

    const where: any = {
        deletedAt: null, // Always filter out soft-deleted doctors
        user: {
            role: 'DOCTOR', // Ensure user has DOCTOR role
            isActive: true, // Ensure user is active
        },
    };

    if (search) {
        // When searching, we need to use AND to combine with base filters
        where.AND = [
            {
                user: {
                    role: 'DOCTOR',
                    isActive: true,
                },
            },
            {
                OR: [
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
                    {
                        specialization: { contains: search, mode: 'insensitive' },
                    },
                ],
            },
        ];
        // Remove the top-level user filter when using AND
        delete where.user;
    }

    const doctors = await prisma.doctor.findMany({
        where,
        skip,
        take,
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

    return { doctors, total, page, limit: limit || total };
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

export const getDoctorByUserId = async (userId: number) => {
    return await prisma.doctor.findUnique({
        where: { userId },
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
