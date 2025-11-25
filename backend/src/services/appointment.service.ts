import { PrismaClient, AppointmentStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';

const prisma = new PrismaClient();

export const getAppointments = async (date?: string, doctorId?: number) => {
    const where: any = {};

    if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        where.scheduledAt = {
            gte: start,
            lte: end,
        };
    }

    if (doctorId) {
        where.doctorId = doctorId;
    }

    return prisma.appointment.findMany({
        where,
        include: {
            patient: true,
            doctor: {
                include: { user: true },
            },
        },
        orderBy: { scheduledAt: 'asc' },
    });
};

export const getAppointmentById = async (id: number) => {
    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
            patient: true,
            doctor: { include: { user: true } },
            medicalRecord: true,
            payment: true,
        },
    });
    if (!appointment) throw new Error('Appointment not found');
    return appointment;
};

export const createAppointment = async (data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }

    const { patientId, doctorId, scheduledAt, complaint } = data;

    // Generate queue number for the scheduled date
    const scheduleDate = new Date(scheduledAt);
    scheduleDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(scheduleDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get last queue number for this doctor on this date
    const lastAppointment = await prisma.appointment.findFirst({
        where: {
            doctorId,
            scheduledAt: {
                gte: scheduleDate,
                lt: nextDay,
            },
        },
        orderBy: { queueNumber: 'desc' },
    });

    const queueNumber = (lastAppointment?.queueNumber || 0) + 1;

    const newAppointment = await prisma.appointment.create({
        data: {
            patientId,
            doctorId,
            scheduledAt: new Date(scheduledAt),
            queueNumber,
            complaint,
            createdById: req.user.id,
            status: AppointmentStatus.PENDING,
        },
        include: {
            patient: true,
            doctor: { include: { user: true } },
        },
    });

    await logActivity(req, 'CREATE', 'APPOINTMENT', newAppointment.id, null, newAppointment);

    return newAppointment;
};

export const updateAppointment = async (id: number, data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldAppointment = await prisma.appointment.findUnique({ where: { id } });
    if (!oldAppointment) throw new Error('Appointment not found');

    const updatedAppointment = await prisma.appointment.update({
        where: { id },
        data,
    });

    await logActivity(req, 'UPDATE', 'APPOINTMENT', id, oldAppointment, updatedAppointment);

    return updatedAppointment;
};

export const cancelAppointment = async (id: number, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldAppointment = await prisma.appointment.findUnique({ where: { id } });
    if (!oldAppointment) throw new Error('Appointment not found');

    const cancelledAppointment = await prisma.appointment.update({
        where: { id },
        data: {
            status: AppointmentStatus.CANCELLED,
        },
    });

    await logActivity(req, 'CANCEL', 'APPOINTMENT', id, oldAppointment, cancelledAppointment);

    return cancelledAppointment;
};

export const reassignDoctor = async (id: number, newDoctorId: number, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldAppointment = await prisma.appointment.findUnique({ where: { id } });
    if (!oldAppointment) throw new Error('Appointment not found');

    const reassignedAppointment = await prisma.appointment.update({
        where: { id },
        data: {
            doctorId: newDoctorId,
        },
    });

    await logActivity(req, 'REASSIGN_DOCTOR', 'APPOINTMENT', id, oldAppointment, reassignedAppointment);

    return reassignedAppointment;
};
