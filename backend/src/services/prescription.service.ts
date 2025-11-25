import { PrismaClient, PrescriptionStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { logActivity } from './activity-log.service';
import { logStockChange } from './stock-monitoring.service';

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

    // Transaction: Create Prescription, Create Items (Check Stock only)
    return prisma.$transaction(async (tx: any) => {
        // 1. Create Prescription
        const prescription = await tx.prescription.create({
            data: {
                medicalRecordId,
                doctorId: doctor.id,
                status: PrescriptionStatus.PENDING,
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

    return prisma.$transaction(async (tx: any) => {
        const oldPrescription = await tx.prescription.findUnique({
            where: { id },
            include: {
                items: { include: { drug: true } },
                medicalRecord: { include: { appointment: true } }
            }
        });

        if (!oldPrescription) throw new Error('Prescription not found');

        // Logic when changing to PREPARED
        if (status === PrescriptionStatus.PREPARED && oldPrescription.status === PrescriptionStatus.PENDING) {
            let prescriptionFee = 0;

            for (const item of oldPrescription.items) {
                const drug = item.drug;
                if (drug.stockQty < item.qty) {
                    throw new Error(`Insufficient stock for drug ${drug.name} during preparation.`);
                }

                // Deduct stock
                const updatedDrug = await tx.drug.update({
                    where: { id: drug.id },
                    data: { stockQty: { decrement: item.qty } },
                });

                // Log stock change in audit log
                await logStockChange(
                    drug.id,
                    'PRESCRIPTION_DISPENSED',
                    item.qty,
                    drug.stockQty,
                    updatedDrug.stockQty,
                    req.user!.id, // Non-null assertion - already checked at function start
                    `Prescription #${id} prepared`
                );

                await logActivity(req, 'DRUG_STOCK_DECREMENT', 'DRUG', drug.id, { stockQty: drug.stockQty }, { stockQty: updatedDrug.stockQty });

                // Calculate Fee
                prescriptionFee += Number(drug.unitPrice) * item.qty;
            }

            // Create/Update Payment
            const appointmentId = oldPrescription.medicalRecord.appointmentId;
            const existingPayment = await tx.payment.findUnique({ where: { appointmentId } });

            if (existingPayment) {
                await tx.payment.update({
                    where: { id: existingPayment.id },
                    data: {
                        prescriptionFee,
                        amount: Number(existingPayment.appointmentFee) + prescriptionFee,
                    }
                });
            } else {
                await tx.payment.create({
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
        if (status === PrescriptionStatus.DISPENSED) {
            const appointmentId = oldPrescription.medicalRecord.appointmentId;
            const payment = await tx.payment.findUnique({ where: { appointmentId } });

            // Optional: Enforce payment before dispense
            if (!payment || payment.status !== 'PAID') {
                // throw new Error('Cannot dispense. Payment not completed.'); 
                // Uncomment above to enforce strict payment check. 
                // For now, we'll allow it but maybe log a warning or return a message.
            }
        }

        const updatedPrescription = await tx.prescription.update({
            where: { id },
            data: { status },
        });

        await logActivity(req, 'UPDATE_STATUS', 'PRESCRIPTION', id, oldPrescription, updatedPrescription);

        return updatedPrescription;
    });
};
