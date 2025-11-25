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
exports.reassignDoctor = exports.cancelAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointmentById = exports.getAppointments = void 0;
const client_1 = require("@prisma/client");
const activity_log_service_1 = require("./activity-log.service");
const prisma = new client_1.PrismaClient();
const getAppointments = (date, doctorId, user) => __awaiter(void 0, void 0, void 0, function* () {
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
    if ((user === null || user === void 0 ? void 0 : user.role) === 'DOCTOR') {
        const doctor = yield prisma.doctor.findUnique({ where: { userId: user.id } });
        if (doctor) {
            where.doctorId = doctor.id;
        }
        else {
            return [];
        }
    }
    else if (doctorId) {
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
const createAppointment = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
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
    const lastAppointment = yield prisma.appointment.findFirst({
        where: {
            doctorId,
            scheduledAt: {
                gte: scheduleDate,
                lt: nextDay,
            },
        },
        orderBy: { queueNumber: 'desc' },
    });
    const queueNumber = ((lastAppointment === null || lastAppointment === void 0 ? void 0 : lastAppointment.queueNumber) || 0) + 1;
    const newAppointment = yield prisma.appointment.create({
        data: {
            patientId,
            doctorId,
            scheduledAt: new Date(scheduledAt),
            queueNumber,
            complaint,
            createdById: req.user.id,
            status: client_1.AppointmentStatus.PENDING,
        },
        include: {
            patient: true,
            doctor: { include: { user: true } },
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'CREATE', 'APPOINTMENT', newAppointment.id, null, newAppointment);
    return newAppointment;
});
exports.createAppointment = createAppointment;
const updateAppointment = (id, data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldAppointment = yield prisma.appointment.findUnique({ where: { id } });
    if (!oldAppointment)
        throw new Error('Appointment not found');
    const updatedAppointment = yield prisma.appointment.update({
        where: { id },
        data,
    });
    yield (0, activity_log_service_1.logActivity)(req, 'UPDATE', 'APPOINTMENT', id, oldAppointment, updatedAppointment);
    return updatedAppointment;
});
exports.updateAppointment = updateAppointment;
const cancelAppointment = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldAppointment = yield prisma.appointment.findUnique({ where: { id } });
    if (!oldAppointment)
        throw new Error('Appointment not found');
    const cancelledAppointment = yield prisma.appointment.update({
        where: { id },
        data: {
            status: client_1.AppointmentStatus.CANCELLED,
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'CANCEL', 'APPOINTMENT', id, oldAppointment, cancelledAppointment);
    return cancelledAppointment;
});
exports.cancelAppointment = cancelAppointment;
const reassignDoctor = (id, newDoctorId, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldAppointment = yield prisma.appointment.findUnique({ where: { id } });
    if (!oldAppointment)
        throw new Error('Appointment not found');
    const reassignedAppointment = yield prisma.appointment.update({
        where: { id },
        data: {
            doctorId: newDoctorId,
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'REASSIGN_DOCTOR', 'APPOINTMENT', id, oldAppointment, reassignedAppointment);
    return reassignedAppointment;
});
exports.reassignDoctor = reassignDoctor;
