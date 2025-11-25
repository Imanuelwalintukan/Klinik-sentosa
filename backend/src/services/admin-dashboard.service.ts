import { PrismaClient, PaymentStatus, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdminDashboardSummary = async () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
        totalPatients,
        totalAppointments,
        todayAppointments,
        activeDoctors,
        allDrugs,
        paymentsTodayAggregate,
        paymentsMonthAggregate,
        pendingAppointmentsCount,
        unpaidPaymentsCount,
    ] = await Promise.all([
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
                status: PaymentStatus.PAID,
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
                status: PaymentStatus.PAID,
                createdAt: {
                    gte: startOfMonth,
                    lt: endOfMonth,
                },
            },
        }),
        prisma.appointment.count({
            where: {
                status: AppointmentStatus.PENDING,
            },
        }),
        prisma.payment.count({
            where: {
                status: PaymentStatus.PENDING,
            },
        }),
    ]);

    const totalPaymentsToday = paymentsTodayAggregate._sum.amount ?? 0;
    const totalPaymentsMonth = paymentsMonthAggregate._sum.amount ?? 0;

    const lowStockDrugs = allDrugs.filter((d) =>
        typeof d.minStock === 'number' && d.stockQty < (d.minStock as number)
    );

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
};
