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
exports.updateAppointment = exports.createAppointment = exports.getAppointmentById = exports.getAppointments = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAppointments = (date, doctorId) => __awaiter(void 0, void 0, void 0, function* () {
    const where = {};
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
});
exports.getAppointments = getAppointments;
const getAppointmentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const appointment = yield prisma.appointment.findUnique({
        where: { id },
        include: {
            patient: true,
            doctor: { include: { user: true } },
            medicalRecord: true,
            payment: true,
        },
    });
    if (!appointment)
        throw new Error('Appointment not found');
    return appointment;
});
exports.getAppointmentById = getAppointmentById;
const createAppointment = (data, createdById) => __awaiter(void 0, void 0, void 0, function* () {
    // Check doctor availability (simplistic check)
    // In a real app, we'd check for overlaps.
    return prisma.appointment.create({
        data: Object.assign(Object.assign({}, data), { createdById, status: client_1.AppointmentStatus.PENDING }),
    });
});
exports.createAppointment = createAppointment;
const updateAppointment = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const appointment = yield prisma.appointment.findUnique({ where: { id } });
    if (!appointment)
        throw new Error('Appointment not found');
    return prisma.appointment.update({
        where: { id },
        data,
    });
});
exports.updateAppointment = updateAppointment;
