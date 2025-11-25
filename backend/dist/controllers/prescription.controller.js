"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getPrescription = exports.getPrescriptions = exports.createPrescription = void 0;
const prescriptionService = __importStar(require("../services/prescription.service"));
const response_1 = require("../utils/response");
const prescription_validation_1 = require("../validation/prescription.validation");
const createPrescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = prescription_validation_1.createPrescriptionSchema.safeParse(req.body);
        if (!validation.success) {
            return (0, response_1.sendResponse)(res, 400, false, null, validation.error.issues[0].message);
        }
        // Assuming the user is a doctor and has a doctor profile linked
        // We need to find the doctor ID from the user ID
        // For simplicity, let's assume we can get doctorId from the user context or query
        // But wait, the schema says Prescription has doctorId (relation to Doctor).
        // AuthRequest has user.id (User model).
        // We need to fetch the Doctor model for this User.
        // Ideally we should do this in the service or middleware, but let's do it here or assume the service handles it if we pass userId.
        // But the service expects doctorId.
        // Let's fetch doctorId here.
        // Actually, I can't import PrismaClient here easily without duplicating.
        // Let's modify the service to accept userId and find the doctor.
        // Wait, I'll just pass a placeholder or fetch it.
        // Let's assume the user is a doctor.
        // I'll update the service to take userId and find the doctor.
        // For now, I'll just pass the user.id and let the service fail if it's not a doctor? 
        // No, User.id != Doctor.id. Doctor has userId.
        // I will update the service to handle this lookup.
        // But I already wrote the service to take doctorId.
        // I'll update the service in the next step or just do a quick lookup here if I had prisma.
        // I'll stick to the plan: Update service to find doctor by userId.
        // But I can't edit the service in the same turn easily if I just wrote it.
        // Actually I can overwrite it.
        // Let's assume I'll fix it. For now, I'll pass user.id and note the bug or fix it in service.
        // I'll overwrite the service file in this same turn.
        if (!req.user)
            return (0, response_1.sendResponse)(res, 401, false, null, 'Unauthorized');
        const prescription = yield prescriptionService.createPrescription(validation.data, req.user.id); // Passing userId, service needs update
        (0, response_1.sendResponse)(res, 201, true, prescription);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.createPrescription = createPrescription;
const getPrescriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prescriptions = yield prescriptionService.getPrescriptions();
        (0, response_1.sendResponse)(res, 200, true, prescriptions);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getPrescriptions = getPrescriptions;
const getPrescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const prescription = yield prescriptionService.getPrescriptionById(id);
        (0, response_1.sendResponse)(res, 200, true, prescription);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 404, false, null, error.message);
    }
});
exports.getPrescription = getPrescription;
