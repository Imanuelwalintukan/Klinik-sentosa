import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';

const prisma = new PrismaClient();

export const getAllPatients = async (query: string = '') => {
    return prisma.patient.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { nik: { contains: query } },
            ],
            deletedAt: null, // Only return non-deleted patients
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getPatientById = async (id: number) => {
    const patient = await prisma.patient.findUnique({
        where: { id, deletedAt: null }, // Only return non-deleted patient
    });
    if (!patient) throw new Error('Patient not found');
    return patient;
};

export const createPatient = async (data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    // Check if NIK exists
    const existing = await prisma.patient.findUnique({
        where: { nik: data.nik },
    });
    if (existing) throw new Error('Patient with this NIK already exists');

    const newPatient = await prisma.patient.create({
        data,
    });

    await logActivity(req, 'CREATE', 'PATIENT', newPatient.id, null, newPatient);

    return newPatient;
};

export const updatePatient = async (id: number, data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldPatient = await prisma.patient.findUnique({ where: { id } });
    if (!oldPatient) throw new Error('Patient not found');

    if (data.nik && data.nik !== oldPatient.nik) {
        const existing = await prisma.patient.findUnique({ where: { nik: data.nik } });
        if (existing) throw new Error('NIK already in use');
    }

    const updatedPatient = await prisma.patient.update({
        where: { id },
        data,
    });

    await logActivity(req, 'UPDATE', 'PATIENT', id, oldPatient, updatedPatient);

    return updatedPatient;
};

export const deletePatient = async (id: number, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldPatient = await prisma.patient.findUnique({ where: { id } });
    if (!oldPatient) throw new Error('Patient not found');

    const deletedPatient = await prisma.patient.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });

    await logActivity(req, 'DELETE', 'PATIENT', id, oldPatient, deletedPatient);

    return deletedPatient;
};
