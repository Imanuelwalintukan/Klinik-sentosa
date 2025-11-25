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
exports.deletePatient = exports.updatePatient = exports.createPatient = exports.getPatientById = exports.getAllPatients = void 0;
const client_1 = require("@prisma/client");
const activity_log_service_1 = require("./activity-log.service");
const prisma = new client_1.PrismaClient();
const getAllPatients = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = '') {
    return prisma.patient.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { nik: { contains: query } },
            ],
            deletedAt: null, // Only return non-deleted patients
        },
        orderBy: { createdAt: 'desc' },
    });
});
exports.getAllPatients = getAllPatients;
const getPatientById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const patient = yield prisma.patient.findUnique({
        where: { id, deletedAt: null }, // Only return non-deleted patient
    });
    if (!patient)
        throw new Error('Patient not found');
    return patient;
});
exports.getPatientById = getPatientById;
const createPatient = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    // Check if NIK exists
    const existing = yield prisma.patient.findUnique({
        where: { nik: data.nik },
    });
    if (existing)
        throw new Error('Patient with this NIK already exists');
    const newPatient = yield prisma.patient.create({
        data,
    });
    yield (0, activity_log_service_1.logActivity)(req, 'CREATE', 'PATIENT', newPatient.id, null, newPatient);
    return newPatient;
});
exports.createPatient = createPatient;
const updatePatient = (id, data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldPatient = yield prisma.patient.findUnique({ where: { id } });
    if (!oldPatient)
        throw new Error('Patient not found');
    if (data.nik && data.nik !== oldPatient.nik) {
        const existing = yield prisma.patient.findUnique({ where: { nik: data.nik } });
        if (existing)
            throw new Error('NIK already in use');
    }
    const updatedPatient = yield prisma.patient.update({
        where: { id },
        data,
    });
    yield (0, activity_log_service_1.logActivity)(req, 'UPDATE', 'PATIENT', id, oldPatient, updatedPatient);
    return updatedPatient;
});
exports.updatePatient = updatePatient;
const deletePatient = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldPatient = yield prisma.patient.findUnique({ where: { id } });
    if (!oldPatient)
        throw new Error('Patient not found');
    const deletedPatient = yield prisma.patient.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });
    yield (0, activity_log_service_1.logActivity)(req, 'DELETE', 'PATIENT', id, oldPatient, deletedPatient);
    return deletedPatient;
});
exports.deletePatient = deletePatient;
