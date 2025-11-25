"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentsByStatus = exports.getRevenueSummary = exports.getMonthlyRevenue = exports.getWeeklyRevenue = exports.getDailyRevenue = exports.getRevenueByDateRange = exports.updatePaymentStatus = exports.getPayments = exports.createPayment = void 0;
const client_1 = require("@prisma/client");
const activity_log_service_1 = require("./activity-log.service");
const prisma = new client_1.PrismaClient();
// CREATE PAYMENT (appointment-based or prescription-based)
const createPayment = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const { appointmentId: providedAppointmentId, prescriptionId, amount, method } = data;
    let targetAppointmentId = providedAppointmentId;
    if (prescriptionId) {
        const prescription = yield prisma.prescription.findUnique({
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
    const appointment = yield prisma.appointment.findUnique({
        where: { id: targetAppointmentId },
    });
    if (!appointment) {
        throw new Error('Appointment not found');
    }
    // Verify no existing payment for this appointment
    const existingPayment = yield prisma.payment.findUnique({
        where: { appointmentId: targetAppointmentId },
    });
    if (existingPayment) {
        throw new Error('Payment already exists for this appointment');
    }
    // Create payment
    const newPayment = yield prisma.payment.create({
        data: {
            appointmentId: targetAppointmentId,
            amount,
            method,
            status: client_1.PaymentStatus.PAID,
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'CREATE', 'PAYMENT', newPayment.id, null, newPayment);
    return newPayment;
});
exports.createPayment = createPayment;
// GET ALL PAYMENTS with deep nested relations
const getPayments = () => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.getPayments = getPayments;
const updatePaymentStatus = (appointmentId, status, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldPayment = yield prisma.payment.findUnique({ where: { appointmentId } });
    if (!oldPayment)
        throw new Error('Payment not found');
    const updatedPayment = yield prisma.payment.update({
        where: { appointmentId },
        data: { status },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'UPDATE_STATUS', 'PAYMENT', oldPayment.id, oldPayment, updatedPayment);
    return updatedPayment;
});
exports.updatePaymentStatus = updatePaymentStatus;
// GET REVENUE BY DATE RANGE
const getRevenueByDateRange = (startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    const payments = yield prisma.payment.findMany({
        where: {
            status: client_1.PaymentStatus.PAID,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            amount: true,
            appointmentFee: true,
            prescriptionFee: true,
            createdAt: true,
        },
    });
    const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalAppointmentFees = payments.reduce((sum, payment) => sum + Number(payment.appointmentFee), 0);
    const totalPrescriptionFees = payments.reduce((sum, payment) => sum + Number(payment.prescriptionFee), 0);
    return {
        totalRevenue,
        totalAppointmentFees,
        totalPrescriptionFees,
        paymentCount: payments.length,
        startDate,
        endDate,
    };
});
exports.getRevenueByDateRange = getRevenueByDateRange;
// GET DAILY REVENUE (today)
const getDailyRevenue = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (0, exports.getRevenueByDateRange)(today, tomorrow);
});
exports.getDailyRevenue = getDailyRevenue;
// GET WEEKLY REVENUE (last 7 days)
const getWeeklyRevenue = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    return (0, exports.getRevenueByDateRange)(weekAgo, today);
});
exports.getWeeklyRevenue = getWeeklyRevenue;
// GET MONTHLY REVENUE (current month)
const getMonthlyRevenue = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    return (0, exports.getRevenueByDateRange)(firstDayOfMonth, lastDayOfMonth);
});
exports.getMonthlyRevenue = getMonthlyRevenue;
// GET REVENUE SUMMARY (daily, weekly, monthly)
const getRevenueSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    const [daily, weekly, monthly] = yield Promise.all([
        (0, exports.getDailyRevenue)(),
        (0, exports.getWeeklyRevenue)(),
        (0, exports.getMonthlyRevenue)(),
    ]);
    return {
        daily,
        weekly,
        monthly,
    };
});
exports.getRevenueSummary = getRevenueSummary;
// GET PAYMENTS BY STATUS
const getPaymentsByStatus = (status) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.payment.findMany({
        where: { status },
        include: {
            appointment: {
                include: {
                    patient: true,
                    doctor: { include: { user: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
});
exports.getPaymentsByStatus = getPaymentsByStatus;
