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
        include: { appointment: { include: { doctor: true } } },
    });
    if (!medicalRecord) throw new Error('Medical record not found');

    // Verify doctor is assigned to this appointment
    if (medicalRecord.appointment.doctorId !== doctor.id) {
        throw new Error('You are not authorized to create prescription for this appointment');
    }

    // Transaction: Create Prescription and Items (NO stock validation or deduction)
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

        // 2. Create Prescription Items (no stock check)
        for (const item of items) {
            const drug = await tx.drug.findUnique({ where: { id: item.drugId } });
            if (!drug) throw new Error(`Drug with ID ${item.drugId} not found`);

            // Create Prescription Item without checking stock
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

export const getPrescriptions = async (status?: string) => {
    const whereClause: any = {};

    if (status) {
        // Handle comma-separated status values
        const statuses = status.split(',').map(s => s.trim());
        if (statuses.length > 1) {
            whereClause.status = { in: statuses as PrescriptionStatus[] };
        } else {
            whereClause.status = status as PrescriptionStatus;
        }
    }

    return prisma.prescription.findMany({
        where: whereClause,
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

        // Logic when changing to PREPARED (validate stock only, don't deduct)
        if (status === PrescriptionStatus.PREPARED && oldPrescription.status === PrescriptionStatus.PENDING) {
            // Validate stock availability for all items
            for (const item of oldPrescription.items) {
                const drug = item.drug;
                if (drug.stockQty < item.qty) {
                    throw new Error(`Insufficient stock for drug ${drug.name}. Available: ${drug.stockQty}, Required: ${item.qty}`);
                }
            }
            // Stock validation passed, but don't deduct yet
            await logActivity(req, 'PREPARE', 'PRESCRIPTION', id, { status: oldPrescription.status }, { status: 'PREPARED' });
        }

        // Logic when changing to DISPENSED (deduct stock and create payment)
        if (status === PrescriptionStatus.DISPENSED && oldPrescription.status === PrescriptionStatus.PREPARED) {
            let prescriptionFee = 0;

            // Deduct stock and calculate prescription fee
            for (const item of oldPrescription.items) {
                const drug = item.drug;

                // Final stock check before deduction
                if (drug.stockQty < item.qty) {
                    throw new Error(`Insufficient stock for drug ${drug.name} during dispensing.`);
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
                    req.user!.id,
                    `Prescription #${id} dispensed`
                );

                await logActivity(req, 'DRUG_STOCK_DECREMENT', 'DRUG', drug.id, { stockQty: drug.stockQty }, { stockQty: updatedDrug.stockQty });

                // Calculate prescription fee
                prescriptionFee += Number(drug.unitPrice) * item.qty;
            }

            // Create or update payment
            const appointmentId = oldPrescription.medicalRecord.appointmentId;
            const existingPayment = await tx.payment.findUnique({ where: { appointmentId } });

            if (existingPayment) {
                // Update existing payment with prescription fee
                await tx.payment.update({
                    where: { id: existingPayment.id },
                    data: {
                        prescriptionFee,
                        amount: Number(existingPayment.appointmentFee) + prescriptionFee,
                    }
                });
                await logActivity(req, 'UPDATE_PRESCRIPTION_FEE', 'PAYMENT', existingPayment.id,
                    { prescriptionFee: existingPayment.prescriptionFee, amount: existingPayment.amount },
                    { prescriptionFee, amount: Number(existingPayment.appointmentFee) + prescriptionFee }
                );
            } else {
                // Create new payment with PENDING status
                const appointmentFee = 50000; // Default appointment fee
                const newPayment = await tx.payment.create({
                    data: {
                        appointmentId,
                        appointmentFee,
                        prescriptionFee,
                        amount: appointmentFee + prescriptionFee,
                        method: 'CASH', // Default method, can be updated later
                        status: 'PENDING',
                    }
                });

                // Log payment auto-creation
                await tx.activityLog.create({
                    data: {
                        userId: req.user!.id,
                        action: 'AUTO_CREATE',
                        entity: 'PAYMENT',
                        entityId: newPayment.id,
                        oldValue: undefined,
                        newValue: newPayment as any,
                    },
                });
            }

            await logActivity(req, 'DISPENSE', 'PRESCRIPTION', id, { status: oldPrescription.status }, { status: 'DISPENSED' });
        }

        // Update prescription status
        const updatedPrescription = await tx.prescription.update({
            where: { id },
            data: { status },
        });

        await logActivity(req, 'UPDATE_STATUS', 'PRESCRIPTION', id, oldPrescription, updatedPrescription);

        return updatedPrescription;
    });
};
