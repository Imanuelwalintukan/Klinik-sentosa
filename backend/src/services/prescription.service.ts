import { PrismaClient, PrescriptionStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';

const prisma = new PrismaClient();

export const createPrescription = async (data: any, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const { medicalRecordId, items } = data;
    const userId = req.user.id;

    // Find Doctor by userId
    const doctor = await prisma.doctor.findUnique({
        where: { userId },
    });
    if (!doctor) throw new Error('Doctor profile not found for this user');

    // Verify medical record exists
    const medicalRecord = await prisma.medicalRecord.findUnique({
        where: { id: medicalRecordId },
    });
    if (!medicalRecord) throw new Error('Medical record not found');

    // Transaction: Create Prescription, Create Items, Decrement Stock
    return prisma.$transaction(async (tx: any) => {
        // 1. Create Prescription
        const prescription = await tx.prescription.create({
            data: {
                medicalRecordId,
                doctorId: doctor.id,
            },
        });

        await logActivity(req, 'CREATE', 'PRESCRIPTION', prescription.id, null, prescription);

        // 2. Process Items
        for (const item of items) {
            const drug = await tx.drug.findUnique({ where: { id: item.drugId } });
            if (!drug) throw new Error(`Drug with ID ${item.drugId} not found`);

            if (drug.stockQty < item.qty) {
                throw new Error(`Insufficient stock for drug ${drug.name}. Available: ${drug.stockQty}, Requested: ${item.qty}`);
            }

            const oldDrugStock = drug.stockQty;
            // Decrement stock
            const updatedDrug = await tx.drug.update({
                where: { id: item.drugId },
                data: { stockQty: { decrement: item.qty } },
            });

            await logActivity(req, 'DRUG_STOCK_DECREMENT', 'DRUG', drug.id, { stockQty: oldDrugStock }, { stockQty: updatedDrug.stockQty });


            // Create Prescription Item
            await tx.prescriptionItem.create({
                data: {
                    prescriptionId: prescription.id,
                    drugId: item.drugId,
                    qty: item.qty,
                    dosageInstructions: item.dosageInstructions,
                },
            });
        }

        return prescription;
    });
};

export const getPrescriptions = async (status?: string) => { // Accept optional status parameter
    const whereClause: { status?: PrescriptionStatus } = {};
    if (status) {
        whereClause.status = status as PrescriptionStatus;
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
};

export const getPrescriptionById = async (id: number) => {
    const prescription = await prisma.prescription.findUnique({
        where: { id },
        include: {
            items: { include: { drug: true } },
            medicalRecord: { include: { appointment: { include: { patient: true } } } },
            doctor: { include: { user: true } },
        },
    });
    if (!prescription) throw new Error('Prescription not found');
    return prescription;
};

export const updatePrescriptionStatus = async (id: number, status: PrescriptionStatus, req: AuthRequest) => {
    if (!req.user) {
        throw new Error('User not authenticated.');
    }
    const oldPrescription = await prisma.prescription.findUnique({ where: { id } });
    if (!oldPrescription) throw new Error('Prescription not found');

    const updatedPrescription = await prisma.prescription.update({
        where: { id },
        data: { status },
    });

    await logActivity(req, 'UPDATE_STATUS', 'PRESCRIPTION', id, oldPrescription, updatedPrescription);

    return updatedPrescription;
};
