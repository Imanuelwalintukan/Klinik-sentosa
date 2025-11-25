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
exports.getPrescriptionById = exports.getPrescriptions = exports.createPrescription = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createPrescription = (data, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const { medicalRecordId, items } = data;
    // Find Doctor by userId
    const doctor = yield prisma.doctor.findUnique({
        where: { userId },
    });
    if (!doctor)
        throw new Error('Doctor profile not found for this user');
    // Verify medical record exists
    const medicalRecord = yield prisma.medicalRecord.findUnique({
        where: { id: medicalRecordId },
    });
    if (!medicalRecord)
        throw new Error('Medical record not found');
    // Transaction: Create Prescription, Create Items, Decrement Stock
    return prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Create Prescription
        const prescription = yield tx.prescription.create({
            data: {
                medicalRecordId,
                doctorId: doctor.id,
            },
        });
        // 2. Process Items
        for (const item of items) {
            const drug = yield tx.drug.findUnique({ where: { id: item.drugId } });
            if (!drug)
                throw new Error(`Drug with ID ${item.drugId} not found`);
            if (drug.stockQty < item.qty) {
                throw new Error(`Insufficient stock for drug ${drug.name}. Available: ${drug.stockQty}, Requested: ${item.qty}`);
            }
            // Decrement stock
            yield tx.drug.update({
                where: { id: item.drugId },
                data: { stockQty: { decrement: item.qty } },
            });
            // Create Prescription Item
            yield tx.prescriptionItem.create({
                data: {
                    prescriptionId: prescription.id,
                    drugId: item.drugId,
                    qty: item.qty,
                    dosageInstructions: item.dosageInstructions,
                },
            });
        }
        return prescription;
    }));
});
exports.createPrescription = createPrescription;
const getPrescriptions = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.prescription.findMany({
        include: {
            items: { include: { drug: true } },
            medicalRecord: { include: { patient: true } },
            doctor: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
});
exports.getPrescriptions = getPrescriptions;
const getPrescriptionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const prescription = yield prisma.prescription.findUnique({
        where: { id },
        include: {
            items: { include: { drug: true } },
            medicalRecord: { include: { patient: true } },
            doctor: { include: { user: true } },
        },
    });
    if (!prescription)
        throw new Error('Prescription not found');
    return prescription;
});
exports.getPrescriptionById = getPrescriptionById;
