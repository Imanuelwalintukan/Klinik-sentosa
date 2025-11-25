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
exports.getPayments = exports.createPayment = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createPayment = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { prescriptionId, amount, method } = data;
    // Verify prescription exists
    const prescription = yield prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: { items: { include: { drug: true } } },
    });
    if (!prescription)
        throw new Error('Prescription not found');
    // Verify no existing payment
    return prisma.payment.create({
        data: {
            prescriptionId,
            amount,
            method,
            status: client_1.PaymentStatus.PAID,
        },
    });
});
exports.createPayment = createPayment;
const getPayments = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.payment.findMany({
        include: {
            prescription: {
                include: {
                    medicalRecord: {
                        include: { patient: true },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
});
exports.getPayments = getPayments;
