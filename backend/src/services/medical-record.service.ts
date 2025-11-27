import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';

const prisma = new PrismaClient();

export const createMedicalRecord = async (data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    // Verify appointment exists
    const appointment = await prisma.appointment.findUnique({
        where: { id: data.appointmentId },
        include: { doctor: true },
    });
    if (!appointment) throw new Error('Appointment not found');

    // Verify doctor is assigned to this appointment
    const doctor = await prisma.doctor.findUnique({
        where: { userId: req.user.id },
    });
    if (!doctor || appointment.doctorId !== doctor.id) {
        throw new Error('You are not authorized to create medical record for this appointment');
    }

    // Verify no existing record for this appointment
    const existing = await prisma.medicalRecord.findUnique({
        where: { appointmentId: data.appointmentId },
    });
    if (existing) throw new Error('Medical record already exists for this appointment');

    const newMedicalRecord = await prisma.medicalRecord.create({
        data,
    });

    // Update appointment status to COMPLETED
    await prisma.appointment.update({
        where: { id: data.appointmentId },
        data: { status: 'COMPLETED' },
    });

    await logActivity(req, 'CREATE', 'MEDICAL_RECORD', newMedicalRecord.id, null, newMedicalRecord);

    return newMedicalRecord;
};

export const getMedicalRecordById = async (id: number) => {
    return prisma.medicalRecord.findUnique({
        where: { id },
        include: {
            appointment: {
                include: {
                    patient: true,
                    doctor: { include: { user: true } },
                },
            },
            prescription: {
                include: { items: { include: { drug: true } } },
            },
        },
    });
};

export const getMedicalRecordByAppointmentId = async (appointmentId: number) => {
    return prisma.medicalRecord.findUnique({
        where: { appointmentId },
        include: {
            appointment: {
                include: {
                    patient: true,
                    doctor: { include: { user: true } },
                },
            },
            prescription: {
                include: { items: { include: { drug: true } } },
            },
        },
    });
};

export const getPatientHistory = async (patientId: number) => {
    const appointments = await prisma.appointment.findMany({
        where: { patientId },
        include: {
            medicalRecord: {
                include: {
                    prescription: {
                        include: { items: { include: { drug: true } } },
                    },
                },
            },
            doctor: { include: { user: true } },
        },
        orderBy: { scheduledAt: 'desc' },
    });

    // Filter to only appointments with medical records
    return appointments.filter(a => a.medicalRecord !== null);
};

export const updateMedicalRecord = async (appointmentId: number, data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldMedicalRecord = await prisma.medicalRecord.findUnique({ where: { appointmentId } });
    if (!oldMedicalRecord) throw new Error('Medical record not found');

    const updatedMedicalRecord = await prisma.medicalRecord.update({
        where: { appointmentId },
        data,
    });

    await logActivity(req, 'UPDATE', 'MEDICAL_RECORD', oldMedicalRecord.id, oldMedicalRecord, updatedMedicalRecord);

    return updatedMedicalRecord;
};
