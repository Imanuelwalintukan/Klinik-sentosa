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
exports.updateMedicalRecord = exports.getMedicalRecordByAppointmentId = exports.createMedicalRecord = void 0;
const client_1 = require("@prisma/client");
const activity_log_service_1 = require("./activity-log.service");
const prisma = new client_1.PrismaClient();
const createMedicalRecord = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    // Verify appointment exists
    const appointment = yield prisma.appointment.findUnique({
        where: { id: data.appointmentId },
    });
    if (!appointment)
        throw new Error('Appointment not found');
    // Verify no existing record for this appointment
    const existing = yield prisma.medicalRecord.findUnique({
        where: { appointmentId: data.appointmentId },
    });
    if (existing)
        throw new Error('Medical record already exists for this appointment');
    const newMedicalRecord = yield prisma.medicalRecord.create({
        data,
    });
    yield (0, activity_log_service_1.logActivity)(req, 'CREATE', 'MEDICAL_RECORD', newMedicalRecord.id, null, newMedicalRecord);
    return newMedicalRecord;
});
exports.createMedicalRecord = createMedicalRecord;
const getMedicalRecordByAppointmentId = (appointmentId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.medicalRecord.findUnique({
        where: { appointmentId },
        include: {
            prescription: {
                include: { items: { include: { drug: true } } },
            },
        },
    });
});
exports.getMedicalRecordByAppointmentId = getMedicalRecordByAppointmentId;
const updateMedicalRecord = (appointmentId, data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldMedicalRecord = yield prisma.medicalRecord.findUnique({ where: { appointmentId } });
    if (!oldMedicalRecord)
        throw new Error('Medical record not found');
    const updatedMedicalRecord = yield prisma.medicalRecord.update({
        where: { appointmentId },
        data,
    });
    yield (0, activity_log_service_1.logActivity)(req, 'UPDATE', 'MEDICAL_RECORD', oldMedicalRecord.id, oldMedicalRecord, updatedMedicalRecord);
    return updatedMedicalRecord;
});
exports.updateMedicalRecord = updateMedicalRecord;
