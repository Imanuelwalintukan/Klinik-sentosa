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
    });
    if (!appointment) throw new Error('Appointment not found');

    // Verify no existing record for this appointment
    const existing = await prisma.medicalRecord.findUnique({
        where: { appointmentId: data.appointmentId },
    });
    if (existing) throw new Error('Medical record already exists for this appointment');

    const newMedicalRecord = await prisma.medicalRecord.create({
        data,
    });

    await logActivity(req, 'CREATE', 'MEDICAL_RECORD', newMedicalRecord.id, null, newMedicalRecord);

    return newMedicalRecord;
};

export const getMedicalRecordByAppointmentId = async (appointmentId: number) => {
    return prisma.medicalRecord.findUnique({
        where: { appointmentId },
        include: {
            prescription: {
                include: { items: { include: { drug: true } } },
            },
        },
    });
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
