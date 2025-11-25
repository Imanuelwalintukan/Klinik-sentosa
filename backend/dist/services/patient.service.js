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
const prisma = new client_1.PrismaClient();
const getAllPatients = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = '') {
    return prisma.patient.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { nik: { contains: query } },
            ],
        },
        orderBy: { createdAt: 'desc' },
    });
});
exports.getAllPatients = getAllPatients;
const getPatientById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const patient = yield prisma.patient.findUnique({
        where: { id },
    });
    if (!patient)
        throw new Error('Patient not found');
    return patient;
});
exports.getPatientById = getPatientById;
const createPatient = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if NIK exists
    const existing = yield prisma.patient.findUnique({
        where: { nik: data.nik },
    });
    if (existing)
        throw new Error('Patient with this NIK already exists');
    return prisma.patient.create({
        data,
    });
});
exports.createPatient = createPatient;
const updatePatient = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const patient = yield prisma.patient.findUnique({ where: { id } });
    if (!patient)
        throw new Error('Patient not found');
    if (data.nik && data.nik !== patient.nik) {
        const existing = yield prisma.patient.findUnique({ where: { nik: data.nik } });
        if (existing)
            throw new Error('NIK already in use');
    }
    return prisma.patient.update({
        where: { id },
        data,
    });
});
exports.updatePatient = updatePatient;
const deletePatient = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.patient.delete({
        where: { id },
    });
});
exports.deletePatient = deletePatient;
