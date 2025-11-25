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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerProfile = exports.getCustomerPayments = exports.getCustomerPrescriptions = exports.getCustomerAppointments = exports.getCustomerQueue = exports.getCustomerProfile = exports.registerCustomer = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const activity_log_service_1 = require("./activity-log.service");
const prisma = new client_1.PrismaClient();
// Register customer (by staff/admin)
const registerCustomer = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const { name, nik, phone, address, birthDate, email, password } = data;
    // Check if patient with NIK exists
    let patient = yield prisma.patient.findUnique({ where: { nik } });
    if (!patient) {
        // Create new patient
        patient = yield prisma.patient.create({
            data: { name, nik, phone, address, birthDate: new Date(birthDate) },
        });
    }
    // Create customer user account
    const passwordHash = yield bcryptjs_1.default.hash(password, 10);
    const customer = yield prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: 'CUSTOMER',
            patientId: patient.id,
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'CREATE', 'CUSTOMER', customer.id, null, customer);
    return { customer, patient };
});
exports.registerCustomer = registerCustomer;
// Get customer profile
const getCustomerProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        include: {
            patient: true,
        },
    });
    if (!user || user.role !== 'CUSTOMER') {
        throw new Error('Customer not found');
    }
    return user;
});
exports.getCustomerProfile = getCustomerProfile;
// Get customer queue status
const getCustomerQueue = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });
    if (!user || !user.patient) {
        throw new Error('Customer not found');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointment = yield prisma.appointment.findFirst({
        where: {
            patientId: user.patient.id,
            scheduledAt: { gte: today },
            status: { in: ['PENDING', 'CONFIRMED'] },
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
    const currentQueue = yield prisma.appointment.findFirst({
        where: {
            doctorId: appointment.doctorId,
            scheduledAt: { gte: today },
            status: { in: ['CONFIRMED'] },
            queueNumber: { lt: appointment.queueNumber },
        },
        orderBy: { queueNumber: 'desc' },
    });
    const position = appointment.queueNumber - ((currentQueue === null || currentQueue === void 0 ? void 0 : currentQueue.queueNumber) || 0);
    const estimatedWaitTime = position * 15; // 15 minutes per patient
    return {
        appointment,
        queueNumber: appointment.queueNumber,
        position,
        estimatedWaitTime,
    };
});
exports.getCustomerQueue = getCustomerQueue;
// Get customer appointments
const getCustomerAppointments = (userId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });
    if (!user || !user.patient) {
        throw new Error('Customer not found');
    }
    const where = { patientId: user.patient.id };
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
});
exports.getCustomerAppointments = getCustomerAppointments;
// Get customer prescriptions
const getCustomerPrescriptions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
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
});
exports.getCustomerPrescriptions = getCustomerPrescriptions;
// Get customer payments
const getCustomerPayments = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
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
});
exports.getCustomerPayments = getCustomerPayments;
// Update customer profile
const updateCustomerProfile = (userId, data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const user = yield prisma.user.findUnique({
        where: { id: userId },
        include: { patient: true },
    });
    if (!user || !user.patient) {
        throw new Error('Customer not found');
    }
    const { name, phone, address } = data;
    // Update patient info
    const updatedPatient = yield prisma.patient.update({
        where: { id: user.patient.id },
        data: { name, phone, address },
    });
    // Update user name
    const updatedUser = yield prisma.user.update({
        where: { id: userId },
        data: { name },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'UPDATE', 'CUSTOMER_PROFILE', userId, user, updatedUser);
    return { user: updatedUser, patient: updatedPatient };
});
exports.updateCustomerProfile = updateCustomerProfile;
