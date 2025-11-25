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
exports.getAdminDashboardSummary = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAdminDashboardSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    const [totalPatients, totalAppointments, todayAppointments, activeDoctors, allDrugs, paymentsTodayAggregate, paymentsMonthAggregate, pendingAppointmentsCount, unpaidPaymentsCount,] = yield Promise.all([
        prisma.patient.count({
            where: { deletedAt: null },
        }),
        prisma.appointment.count(),
        prisma.appointment.count({
            where: {
                scheduledAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        }),
        prisma.doctor.count({
            where: {
                user: {
                    isActive: true,
                },
                deletedAt: null,
            },
        }),
        prisma.drug.findMany({
            where: {
                deletedAt: null,
                minStock: { not: null },
            },
            select: {
                id: true,
                name: true, // Include name here
                stockQty: true,
                minStock: true,
                expiryDate: true,
            },
        }),
        prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                status: client_1.PaymentStatus.PAID,
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        }),
        prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                status: client_1.PaymentStatus.PAID,
                createdAt: {
                    gte: startOfMonth,
                    lt: endOfMonth,
                },
            },
        }),
        prisma.appointment.count({
            where: {
                status: client_1.AppointmentStatus.PENDING,
            },
        }),
        prisma.payment.count({
            where: {
                status: client_1.PaymentStatus.PENDING,
            },
        }),
    ]);
    const totalPaymentsToday = (_a = paymentsTodayAggregate._sum.amount) !== null && _a !== void 0 ? _a : 0;
    const totalPaymentsMonth = (_b = paymentsMonthAggregate._sum.amount) !== null && _b !== void 0 ? _b : 0;
    const lowStockDrugs = allDrugs.filter((d) => typeof d.minStock === 'number' && d.stockQty < d.minStock);
    const expiringDrugs = allDrugs.filter((d) => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return d.expiryDate && new Date(d.expiryDate) < thirtyDaysFromNow;
    });
    return {
        totalPatients,
        totalAppointments,
        todayAppointments,
        activeDoctors,
        lowStockDrugsCount: lowStockDrugs.length,
        expiringDrugsCount: expiringDrugs.length,
        totalPaymentsToday: Number(totalPaymentsToday),
        totalPaymentsMonth: Number(totalPaymentsMonth),
        pendingAppointmentsCount,
        unpaidPaymentsCount,
        lowStockDrugDetails: lowStockDrugs.map(d => ({ id: d.id, name: d.name, stockQty: d.stockQty, minStock: d.minStock })),
        expiringDrugDetails: expiringDrugs.map(d => ({ id: d.id, name: d.name, expiryDate: d.expiryDate })),
    };
});
exports.getAdminDashboardSummary = getAdminDashboardSummary;
