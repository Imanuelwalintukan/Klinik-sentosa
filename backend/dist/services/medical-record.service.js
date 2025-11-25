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
exports.getMedicalRecordByAppointmentId = exports.createMedicalRecord = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createMedicalRecord = (data) => __awaiter(void 0, void 0, void 0, function* () {
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
    return prisma.medicalRecord.create({
        data,
    });
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
