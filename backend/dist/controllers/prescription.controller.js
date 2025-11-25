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
exports.updatePrescriptionStatus = exports.getPrescription = exports.getPrescriptions = exports.createPrescription = void 0;
const prescriptionService = __importStar(require("../services/prescription.service"));
const response_1 = require("../utils/response");
const prescription_validation_1 = require("../validation/prescription.validation");
const createPrescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = prescription_validation_1.createPrescriptionSchema.safeParse(req.body);
        if (!validation.success) {
            return (0, response_1.sendResponse)(res, 400, false, null, validation.error.issues[0].message);
        }
        if (!req.user)
            return (0, response_1.sendResponse)(res, 401, false, null, 'Unauthorized');
        const prescription = yield prescriptionService.createPrescription(validation.data, req);
        (0, response_1.sendResponse)(res, 201, true, prescription);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.createPrescription = createPrescription;
const getPrescriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query; // Extract status from query
        const prescriptions = yield prescriptionService.getPrescriptions(status); // Pass status to service
        (0, response_1.sendResponse)(res, 200, true, prescriptions);
    }
    catch (error) { // Cast error to any
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
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 404, false, null, error.message);
    }
});
exports.getPrescription = getPrescription;
const updatePrescriptionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const validation = prescription_validation_1.updatePrescriptionStatusValidation.safeParse(req.body); // Use zod safeParse
        if (!validation.success) {
            return (0, response_1.sendResponse)(res, 400, false, null, validation.error.issues[0].message);
        }
        const { status } = validation.data; // Get data from validation.data
        const updatedPrescription = yield prescriptionService.updatePrescriptionStatus(id, status, req);
        (0, response_1.sendResponse)(res, 200, true, updatedPrescription);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.updatePrescriptionStatus = updatePrescriptionStatus;
