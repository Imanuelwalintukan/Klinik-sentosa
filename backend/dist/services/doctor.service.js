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
exports.deleteDoctor = exports.updateDoctor = exports.createDoctor = exports.getDoctorById = exports.getAllDoctors = void 0;
const client_1 = require("@prisma/client");
const activity_log_service_1 = require("./activity-log.service");
const prisma = new client_1.PrismaClient();
const getAllDoctors = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;
    const where = {
        deletedAt: null, // Always filter out soft-deleted doctors
    };
    if (search) {
        where.OR = [
            {
                user: {
                    name: { contains: search, mode: 'insensitive' },
                },
            },
            {
                user: {
                    email: { contains: search, mode: 'insensitive' },
                },
            },
            { specialization: { contains: search, mode: 'insensitive' } },
        ];
    }
    const doctors = yield prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        include: {
            user: true,
        },
        orderBy: {
            user: {
                name: 'asc' // Order by doctor's name
            },
        },
    });
    const total = yield prisma.doctor.count({ where });
    return { doctors, total, page, limit };
});
exports.getAllDoctors = getAllDoctors;
const getDoctorById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.doctor.findUnique({
        where: { id },
        include: {
            user: true,
            appointments: true,
        },
    });
});
exports.getDoctorById = getDoctorById;
const createDoctor = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const { userId, specialization, sip, schedule } = data;
    const newDoctor = yield prisma.doctor.create({
        data: {
            userId,
            specialization,
            sip,
            schedule,
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'CREATE', 'DOCTOR', newDoctor.id, null, newDoctor);
    return newDoctor;
});
exports.createDoctor = createDoctor;
const updateDoctor = (id, data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldDoctor = yield prisma.doctor.findUnique({ where: { id } });
    const updatedDoctor = yield prisma.doctor.update({
        where: { id },
        data,
    });
    yield (0, activity_log_service_1.logActivity)(req, 'UPDATE', 'DOCTOR', id, oldDoctor, updatedDoctor);
    return updatedDoctor;
});
exports.updateDoctor = updateDoctor;
const deleteDoctor = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldDoctor = yield prisma.doctor.findUnique({ where: { id } });
    const deletedDoctor = yield prisma.doctor.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'DELETE', 'DOCTOR', id, oldDoctor, deletedDoctor);
    return deletedDoctor;
});
exports.deleteDoctor = deleteDoctor;
