import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';

const prisma = new PrismaClient();

// Register customer (by staff/admin)
export const registerCustomer = async (data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }

    const { name, nik, phone, address, birthDate, email, password } = data;

    // Check if patient with NIK exists
    let patient = await prisma.patient.findUnique({ where: { nik } });

    if (!patient) {
        // Create new patient
        patient = await prisma.patient.create({
            data: { name, nik, phone, address, birthDate: new Date(birthDate) },
        });
    }

    // Create customer user account
    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: 'CUSTOMER',
            patientId: patient.id,
        },
    });

    await logActivity(req, 'CREATE', 'CUSTOMER', customer.id, null, customer);

    return { customer, patient };
};

// Get customer profile
export const getCustomerProfile = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            patient: true,
        },
    });

    if (!user || user.role !== 'CUSTOMER') {
        throw new Error('Customer not found');
    }

    return user;
};

// Get customer queue status
export const getCustomerQueue = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });

    if (!user || !user.patient) {
        throw new Error('Customer not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointment = await prisma.appointment.findFirst({
        where: {
            patientId: user.patient.id,
            scheduledAt: { gte: today },
            status: { in: ['PENDING', 'CONFIRMED', 'PATIENT_ARRIVED'] },
        },
        include: {
            doctor: { include: { user: true } },
        },
        orderBy: { scheduledAt: 'asc' },
    });

    if (!appointment || !appointment.queueNumber) {
        return null;
    }

    // Get current queue position
    const currentQueue = await prisma.appointment.findFirst({
        where: {
            doctorId: appointment.doctorId,
            scheduledAt: { gte: today },
            status: { in: ['PATIENT_ARRIVED', 'CONFIRMED'] },
            queueNumber: { lt: appointment.queueNumber },
        },
        orderBy: { queueNumber: 'desc' },
    });

    const position = appointment.queueNumber - (currentQueue?.queueNumber || 0);
    const estimatedWaitTime = position * 15; // 15 minutes per patient

    return {
        appointment,
        queueNumber: appointment.queueNumber,
        position,
        estimatedWaitTime,
    };
};

// Get customer appointments
export const getCustomerAppointments = async (userId: number, status?: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });

    if (!user || !user.patient) {
        throw new Error('Customer not found');
    }

    const where: any = { patientId: user.patient.id };
    if (status) {
        where.status = status;
    }

    return prisma.appointment.findMany({
        where,
        include: {
            doctor: { include: { user: true } },
            medicalRecord: true,
            payment: true,
        },
        orderBy: { scheduledAt: 'desc' },
    });
};

// Get customer prescriptions
export const getCustomerPrescriptions = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });

    if (!user || !user.patient) {
        throw new Error('Customer not found');
    }

    return prisma.prescription.findMany({
        where: {
            medicalRecord: {
                appointment: {
                    patientId: user.patient.id,
                },
            },
        },
        include: {
            items: { include: { drug: true } },
            medicalRecord: {
                include: {
                    appointment: { include: { doctor: { include: { user: true } } } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

// Get customer payments
export const getCustomerPayments = async (userId: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });

    if (!user || !user.patient) {
        throw new Error('Customer not found');
    }

    return prisma.payment.findMany({
        where: {
            appointment: {
                patientId: user.patient.id,
            },
        },
        include: {
            appointment: {
                include: {
                    doctor: { include: { user: true } },
                    medicalRecord: {
                        include: {
                            prescription: {
                                include: {
                                    items: { include: { drug: true } },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

// Update customer profile
export const updateCustomerProfile = async (userId: number, data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });

    if (!user || !user.patient) {
        throw new Error('Customer not found');
    }

    const { name, phone, address } = data;

    // Update patient info
    const updatedPatient = await prisma.patient.update({
        where: { id: user.patient.id },
        data: { name, phone, address },
    });

    // Update user name
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name },
    });

    await logActivity(req, 'UPDATE', 'CUSTOMER_PROFILE', userId, user, updatedUser);

    return { user: updatedUser, patient: updatedPatient };
};
