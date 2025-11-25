import { PrismaClient } from '@prisma/client';
import { createPrescription } from '../src/services/prescription.service';
import { createDrug } from '../src/services/drug.service';

const prisma = new PrismaClient();

describe('Prescription Service - Stock Management', () => {
    let testDoctorId: number;
    let testMedicalRecordId: number;
    let testDrug1Id: number;
    let testDrug2Id: number;

    beforeAll(async () => {
        // Setup test data
        const doctor = await prisma.doctor.findFirst();
        testDoctorId = doctor!.id;

        // Create test medical record
        const patient = await prisma.patient.findFirst();
        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient!.id,
                doctorId: testDoctorId,
                scheduledAt: new Date(),
                status: 'CONFIRMED',
                createdById: 1,
            },
        });

        const medicalRecord = await prisma.medicalRecord.create({
            data: {
                appointmentId: appointment.id,
                patientId: patient!.id,
                doctorId: testDoctorId,
                diagnosis: 'Test diagnosis',
            },
        });
        testMedicalRecordId = medicalRecord.id;

        // Create test drugs with known stock
        const drug1 = await prisma.drug.create({
            data: {
                name: 'Test Drug A',
                sku: 'TEST-A-001',
                unitPrice: 5000,
                stockQty: 100,
            },
        });
        testDrug1Id = drug1.id;

        const drug2 = await prisma.drug.create({
            data: {
                name: 'Test Drug B',
                sku: 'TEST-B-001',
                unitPrice: 3000,
                stockQty: 50,
            },
        });
        testDrug2Id = drug2.id;
    });

    afterAll(async () => {
        // Cleanup test data
        await prisma.prescriptionItem.deleteMany({
            where: {
                prescription: {
                    medicalRecordId: testMedicalRecordId,
                },
            },
        });
        await prisma.prescription.deleteMany({
            where: { medicalRecordId: testMedicalRecordId },
        });
        await prisma.medicalRecord.deleteMany({
            where: { id: testMedicalRecordId },
        });
        await prisma.drug.deleteMany({
            where: { id: { in: [testDrug1Id, testDrug2Id] } },
        });
        await prisma.$disconnect();
    });

    test('should create prescription and decrement stock correctly', async () => {
        const prescriptionData = {
            medicalRecordId: testMedicalRecordId,
            items: [
                { drugId: testDrug1Id, qty: 10, dosageInstructions: '3x daily' },
                { drugId: testDrug2Id, qty: 5, dosageInstructions: '1x daily' },
            ],
        };

        // Get initial stock levels
        const initialDrug1 = await prisma.drug.findUnique({ where: { id: testDrug1Id } });
        const initialDrug2 = await prisma.drug.findUnique({ where: { id: testDrug2Id } });

        // Create prescription
        const user = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
        const prescription = await createPrescription(prescriptionData, user!.id);

        // Verify prescription was created
        expect(prescription).toBeDefined();
        expect(prescription.id).toBeDefined();

        // Verify prescription items were created
        const prescriptionItems = await prisma.prescriptionItem.findMany({
            where: { prescriptionId: prescription.id },
        });
        expect(prescriptionItems).toHaveLength(2);

        // Verify stock was decremented
        const updatedDrug1 = await prisma.drug.findUnique({ where: { id: testDrug1Id } });
        const updatedDrug2 = await prisma.drug.findUnique({ where: { id: testDrug2Id } });

        expect(updatedDrug1!.stockQty).toBe(initialDrug1!.stockQty - 10);
        expect(updatedDrug2!.stockQty).toBe(initialDrug2!.stockQty - 5);
    });

    test('should fail when insufficient stock', async () => {
        const prescriptionData = {
            medicalRecordId: testMedicalRecordId,
            items: [
                { drugId: testDrug1Id, qty: 1000, dosageInstructions: '3x daily' }, // More than available
            ],
        };

        const user = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });

        // Should throw error
        await expect(createPrescription(prescriptionData, user!.id)).rejects.toThrow(
            /Insufficient stock/
        );

        // Verify stock was not changed (transaction rollback)
        const drug = await prisma.drug.findUnique({ where: { id: testDrug1Id } });
        expect(drug!.stockQty).toBeGreaterThan(0); // Stock should remain unchanged
    });

    test('should rollback entire transaction if one drug has insufficient stock', async () => {
        const prescriptionData = {
            medicalRecordId: testMedicalRecordId,
            items: [
                { drugId: testDrug1Id, qty: 5, dosageInstructions: '3x daily' }, // Valid
                { drugId: testDrug2Id, qty: 1000, dosageInstructions: '1x daily' }, // Invalid - too much
            ],
        };

        const initialDrug1 = await prisma.drug.findUnique({ where: { id: testDrug1Id } });
        const initialDrug2 = await prisma.drug.findUnique({ where: { id: testDrug2Id } });

        const user = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });

        // Should throw error
        await expect(createPrescription(prescriptionData, user!.id)).rejects.toThrow();

        // Verify BOTH stocks remain unchanged (transaction rollback)
        const updatedDrug1 = await prisma.drug.findUnique({ where: { id: testDrug1Id } });
        const updatedDrug2 = await prisma.drug.findUnique({ where: { id: testDrug2Id } });

        expect(updatedDrug1!.stockQty).toBe(initialDrug1!.stockQty);
        expect(updatedDrug2!.stockQty).toBe(initialDrug2!.stockQty);

        // Verify no prescription was created
        const prescriptions = await prisma.prescription.findMany({
            where: { medicalRecordId: testMedicalRecordId },
        });
        expect(prescriptions).toHaveLength(0);
    });

    test('should handle concurrent prescription creation correctly', async () => {
        // This tests that transactions prevent race conditions
        const prescriptionData1 = {
            medicalRecordId: testMedicalRecordId,
            items: [{ drugId: testDrug1Id, qty: 10, dosageInstructions: '3x daily' }],
        };

        const prescriptionData2 = {
            medicalRecordId: testMedicalRecordId,
            items: [{ drugId: testDrug1Id, qty: 15, dosageInstructions: '2x daily' }],
        };

        const user = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
        const initialStock = await prisma.drug.findUnique({ where: { id: testDrug1Id } });

        // Create two prescriptions concurrently
        await Promise.all([
            createPrescription(prescriptionData1, user!.id),
            createPrescription(prescriptionData2, user!.id),
        ]);

        // Verify final stock is correct
        const finalStock = await prisma.drug.findUnique({ where: { id: testDrug1Id } });
        expect(finalStock!.stockQty).toBe(initialStock!.stockQty - 25);
    });
});
