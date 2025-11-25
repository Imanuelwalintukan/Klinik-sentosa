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
exports.updatePrescriptionStatus = exports.getPrescriptionById = exports.getPrescriptions = exports.createPrescription = void 0;
const client_1 = require("@prisma/client");
const activity_log_service_1 = require("./activity-log.service");
const prisma = new client_1.PrismaClient();
const createPrescription = (data, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const { medicalRecordId, items } = data;
    const userId = req.user.id;
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
    // Transaction: Create Prescription, Create Items (Check Stock only)
    return prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Create Prescription
        const prescription = yield tx.prescription.create({
            data: {
                medicalRecordId,
                doctorId: doctor.id,
                status: client_1.PrescriptionStatus.PENDING,
            },
        });
        yield (0, activity_log_service_1.logActivity)(req, 'CREATE', 'PRESCRIPTION', prescription.id, null, prescription);
        // 2. Process Items
        for (const item of items) {
            const drug = yield tx.drug.findUnique({ where: { id: item.drugId } });
            if (!drug)
                throw new Error(`Drug with ID ${item.drugId} not found`);
            if (drug.stockQty < item.qty) {
                throw new Error(`Insufficient stock for drug ${drug.name}. Available: ${drug.stockQty}, Requested: ${item.qty}`);
            }
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
const getPrescriptions = (status) => __awaiter(void 0, void 0, void 0, function* () {
    const whereClause = {};
    if (status) {
        whereClause.status = status;
    }
    return prisma.prescription.findMany({
        where: whereClause, // Apply the where clause
        include: {
            items: { include: { drug: true } },
            medicalRecord: { include: { appointment: { include: { patient: true } } } },
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
            medicalRecord: { include: { appointment: { include: { patient: true } } } },
            doctor: { include: { user: true } },
        },
    });
    if (!prescription)
        throw new Error('Prescription not found');
    return prescription;
});
exports.getPrescriptionById = getPrescriptionById;
const updatePrescriptionStatus = (id, status, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    return prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const oldPrescription = yield tx.prescription.findUnique({
            where: { id },
            include: {
                items: { include: { drug: true } },
                medicalRecord: { include: { appointment: true } }
            }
        });
        if (!oldPrescription)
            throw new Error('Prescription not found');
        // Logic when changing to PREPARED
        if (status === client_1.PrescriptionStatus.PREPARED && oldPrescription.status === client_1.PrescriptionStatus.PENDING) {
            let prescriptionFee = 0;
            for (const item of oldPrescription.items) {
                const drug = item.drug;
                if (drug.stockQty < item.qty) {
                    throw new Error(`Insufficient stock for drug ${drug.name} during preparation.`);
                }
                // Deduct stock
                const updatedDrug = yield tx.drug.update({
                    where: { id: drug.id },
                    data: { stockQty: { decrement: item.qty } },
                });
                yield (0, activity_log_service_1.logActivity)(req, 'DRUG_STOCK_DECREMENT', 'DRUG', drug.id, { stockQty: drug.stockQty }, { stockQty: updatedDrug.stockQty });
                // Calculate Fee
                prescriptionFee += Number(drug.unitPrice) * item.qty;
            }
            // Create/Update Payment
            const appointmentId = oldPrescription.medicalRecord.appointmentId;
            const existingPayment = yield tx.payment.findUnique({ where: { appointmentId } });
            if (existingPayment) {
                yield tx.payment.update({
                    where: { id: existingPayment.id },
                    data: {
                        prescriptionFee,
                        amount: Number(existingPayment.appointmentFee) + prescriptionFee,
                    }
                });
            }
            else {
                yield tx.payment.create({
                    data: {
                        appointmentId,
                        appointmentFee: 50000, // Default fee
                        prescriptionFee,
                        amount: 50000 + prescriptionFee,
                        method: 'CASH', // Default, can be updated later
                        status: 'PENDING',
                    }
                });
            }
        }
        // Logic when changing to DISPENSED
        if (status === client_1.PrescriptionStatus.DISPENSED) {
            const appointmentId = oldPrescription.medicalRecord.appointmentId;
            const payment = yield tx.payment.findUnique({ where: { appointmentId } });
            // Optional: Enforce payment before dispense
            if (!payment || payment.status !== 'PAID') {
                // throw new Error('Cannot dispense. Payment not completed.'); 
                // Uncomment above to enforce strict payment check. 
                // For now, we'll allow it but maybe log a warning or return a message.
            }
        }
        const updatedPrescription = yield tx.prescription.update({
            where: { id },
            data: { status },
        });
        yield (0, activity_log_service_1.logActivity)(req, 'UPDATE_STATUS', 'PRESCRIPTION', id, oldPrescription, updatedPrescription);
        return updatedPrescription;
    }));
});
exports.updatePrescriptionStatus = updatePrescriptionStatus;
