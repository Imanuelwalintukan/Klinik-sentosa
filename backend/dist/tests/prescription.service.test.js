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
const client_1 = require("@prisma/client");
const prescription_service_1 = require("../src/services/prescription.service");
const prisma = new client_1.PrismaClient();
describe('Prescription Service - Stock Management', () => {
    let testDoctorId;
    let testMedicalRecordId;
    let testDrug1Id;
    let testDrug2Id;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup test data
        const doctor = yield prisma.doctor.findFirst();
        testDoctorId = doctor.id;
        // Create test medical record
        const patient = yield prisma.patient.findFirst();
        const appointment = yield prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: testDoctorId,
                scheduledAt: new Date(),
                status: 'CONFIRMED',
                createdById: 1,
            },
        });
        const medicalRecord = yield prisma.medicalRecord.create({
            data: {
                appointmentId: appointment.id,
                patientId: patient.id,
                doctorId: testDoctorId,
                diagnosis: 'Test diagnosis',
            },
        });
        testMedicalRecordId = medicalRecord.id;
        // Create test drugs with known stock
        const drug1 = yield prisma.drug.create({
            data: {
                name: 'Test Drug A',
                sku: 'TEST-A-001',
                unitPrice: 5000,
                stockQty: 100,
            },
        });
        testDrug1Id = drug1.id;
        const drug2 = yield prisma.drug.create({
            data: {
                name: 'Test Drug B',
                sku: 'TEST-B-001',
                unitPrice: 3000,
                stockQty: 50,
            },
        });
        testDrug2Id = drug2.id;
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Cleanup test data
        yield prisma.prescriptionItem.deleteMany({
            where: {
                prescription: {
                    medicalRecordId: testMedicalRecordId,
                },
            },
        });
        yield prisma.prescription.deleteMany({
            where: { medicalRecordId: testMedicalRecordId },
        });
        yield prisma.medicalRecord.deleteMany({
            where: { id: testMedicalRecordId },
        });
        yield prisma.drug.deleteMany({
            where: { id: { in: [testDrug1Id, testDrug2Id] } },
        });
        yield prisma.$disconnect();
    }));
    test('should create prescription and decrement stock correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const prescriptionData = {
            medicalRecordId: testMedicalRecordId,
            items: [
                { drugId: testDrug1Id, qty: 10, dosageInstructions: '3x daily' },
                { drugId: testDrug2Id, qty: 5, dosageInstructions: '1x daily' },
            ],
        };
        // Get initial stock levels
        const initialDrug1 = yield prisma.drug.findUnique({ where: { id: testDrug1Id } });
        const initialDrug2 = yield prisma.drug.findUnique({ where: { id: testDrug2Id } });
        // Create prescription
        const user = yield prisma.user.findFirst({ where: { role: 'DOCTOR' } });
        const prescription = yield (0, prescription_service_1.createPrescription)(prescriptionData, user.id);
        // Verify prescription was created
        expect(prescription).toBeDefined();
        expect(prescription.id).toBeDefined();
        // Verify prescription items were created
        const prescriptionItems = yield prisma.prescriptionItem.findMany({
            where: { prescriptionId: prescription.id },
        });
        expect(prescriptionItems).toHaveLength(2);
        // Verify stock was decremented
        const updatedDrug1 = yield prisma.drug.findUnique({ where: { id: testDrug1Id } });
        const updatedDrug2 = yield prisma.drug.findUnique({ where: { id: testDrug2Id } });
        expect(updatedDrug1.stockQty).toBe(initialDrug1.stockQty - 10);
        expect(updatedDrug2.stockQty).toBe(initialDrug2.stockQty - 5);
    }));
    test('should fail when insufficient stock', () => __awaiter(void 0, void 0, void 0, function* () {
        const prescriptionData = {
            medicalRecordId: testMedicalRecordId,
            items: [
                { drugId: testDrug1Id, qty: 1000, dosageInstructions: '3x daily' }, // More than available
            ],
        };
        const user = yield prisma.user.findFirst({ where: { role: 'DOCTOR' } });
        // Should throw error
        yield expect((0, prescription_service_1.createPrescription)(prescriptionData, user.id)).rejects.toThrow(/Insufficient stock/);
        // Verify stock was not changed (transaction rollback)
        const drug = yield prisma.drug.findUnique({ where: { id: testDrug1Id } });
        expect(drug.stockQty).toBeGreaterThan(0); // Stock should remain unchanged
    }));
    test('should rollback entire transaction if one drug has insufficient stock', () => __awaiter(void 0, void 0, void 0, function* () {
        const prescriptionData = {
            medicalRecordId: testMedicalRecordId,
            items: [
                { drugId: testDrug1Id, qty: 5, dosageInstructions: '3x daily' }, // Valid
                { drugId: testDrug2Id, qty: 1000, dosageInstructions: '1x daily' }, // Invalid - too much
            ],
        };
        const initialDrug1 = yield prisma.drug.findUnique({ where: { id: testDrug1Id } });
        const initialDrug2 = yield prisma.drug.findUnique({ where: { id: testDrug2Id } });
        const user = yield prisma.user.findFirst({ where: { role: 'DOCTOR' } });
        // Should throw error
        yield expect((0, prescription_service_1.createPrescription)(prescriptionData, user.id)).rejects.toThrow();
        // Verify BOTH stocks remain unchanged (transaction rollback)
        const updatedDrug1 = yield prisma.drug.findUnique({ where: { id: testDrug1Id } });
        const updatedDrug2 = yield prisma.drug.findUnique({ where: { id: testDrug2Id } });
        expect(updatedDrug1.stockQty).toBe(initialDrug1.stockQty);
        expect(updatedDrug2.stockQty).toBe(initialDrug2.stockQty);
        // Verify no prescription was created
        const prescriptions = yield prisma.prescription.findMany({
            where: { medicalRecordId: testMedicalRecordId },
        });
        expect(prescriptions).toHaveLength(0);
    }));
    test('should handle concurrent prescription creation correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        // This tests that transactions prevent race conditions
        const prescriptionData1 = {
            medicalRecordId: testMedicalRecordId,
            items: [{ drugId: testDrug1Id, qty: 10, dosageInstructions: '3x daily' }],
        };
        const prescriptionData2 = {
            medicalRecordId: testMedicalRecordId,
            items: [{ drugId: testDrug1Id, qty: 15, dosageInstructions: '2x daily' }],
        };
        const user = yield prisma.user.findFirst({ where: { role: 'DOCTOR' } });
        const initialStock = yield prisma.drug.findUnique({ where: { id: testDrug1Id } });
        // Create two prescriptions concurrently
        yield Promise.all([
            (0, prescription_service_1.createPrescription)(prescriptionData1, user.id),
            (0, prescription_service_1.createPrescription)(prescriptionData2, user.id),
        ]);
        // Verify final stock is correct
        const finalStock = yield prisma.drug.findUnique({ where: { id: testDrug1Id } });
        expect(finalStock.stockQty).toBe(initialStock.stockQty - 25);
    }));
});
