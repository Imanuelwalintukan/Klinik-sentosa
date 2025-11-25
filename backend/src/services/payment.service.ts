import { PrismaClient, PaymentStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';

const prisma = new PrismaClient();

// CREATE PAYMENT (appointment-based or prescription-based)
export const createPayment = async (data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const { appointmentId: providedAppointmentId, prescriptionId, amount, method } = data;

    let targetAppointmentId = providedAppointmentId;

    if (prescriptionId) {
        const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: {
                medicalRecord: {
                    include: {
                        appointment: true
                    }
                }
            }
        });

        if (!prescription || !prescription.medicalRecord || !prescription.medicalRecord.appointment) {
            throw new Error('Prescription or associated appointment not found');
        }
        targetAppointmentId = prescription.medicalRecord.appointment.id;
    }

    if (!targetAppointmentId) {
        throw new Error('Either appointmentId or prescriptionId must be provided');
    }

    // Verify appointment exists
    const appointment = await prisma.appointment.findUnique({
        where: { id: targetAppointmentId },
    });

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    // Verify no existing payment for this appointment
    const existingPayment = await prisma.payment.findUnique({
        where: { appointmentId: targetAppointmentId },
    });

    if (existingPayment) {
        throw new Error('Payment already exists for this appointment');
    }

    // Create payment
    const newPayment = await prisma.payment.create({
        data: {
            appointmentId: targetAppointmentId,
            amount,
            method,
            status: PaymentStatus.PAID,
        },
    });

    await logActivity(req, 'CREATE', 'PAYMENT', newPayment.id, null, newPayment);

    return newPayment;
};

// GET ALL PAYMENTS with deep nested relations
export const getPayments = async () => {
    return prisma.payment.findMany({
        include: {
            appointment: {
                include: {
                    patient: true,
                    doctor: { include: { user: true } },
                    medicalRecord: {
                        include: {
                            prescription: {
                                include: {
                                    items: {
                                        include: {
                                            drug: true,
                                        },
                                    },
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

export const updatePaymentStatus = async (appointmentId: number, status: PaymentStatus, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldPayment = await prisma.payment.findUnique({ where: { appointmentId } });
    if (!oldPayment) throw new Error('Payment not found');

    const updatedPayment = await prisma.payment.update({
        where: { appointmentId },
        data: { status },
    });

    await logActivity(req, 'UPDATE_STATUS', 'PAYMENT', oldPayment.id, oldPayment, updatedPayment);

    return updatedPayment;
};

// Revenue report helper
export const getRevenueReport = async (startDate: Date, endDate: Date) => {
    const payments = await prisma.payment.findMany({
        where: {
            status: PaymentStatus.PAID,
            createdAt: { gte: startDate, lte: endDate }
        },
        include: {
            appointment: {
                include: {
                    patient: true,
                    doctor: { include: { user: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalAppointmentFees = payments.reduce((sum, p) => sum + Number(p.appointmentFee), 0);
    const totalPrescriptionFees = payments.reduce((sum, p) => sum + Number(p.prescriptionFee), 0);

    return {
        payments,
        totalRevenue,
        totalAppointmentFees,
        totalPrescriptionFees,
        count: payments.length
    };
};

// Get daily revenue
export const getDailyRevenue = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getRevenueReport(today, tomorrow);
};

// Get weekly revenue
export const getWeeklyRevenue = async () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return getRevenueReport(weekAgo, today);
};

// Get monthly revenue
export const getMonthlyRevenue = async () => {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return getRevenueReport(monthAgo, today);
};
