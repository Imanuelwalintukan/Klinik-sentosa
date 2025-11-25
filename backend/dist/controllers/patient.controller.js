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
exports.deletePatient = exports.updatePatient = exports.createPatient = exports.getPatient = exports.getPatients = void 0;
const patientService = __importStar(require("../services/patient.service"));
const response_1 = require("../utils/response");
const patient_validation_1 = require("../validation/patient.validation");
const getPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.q;
        const patients = yield patientService.getAllPatients(query);
        (0, response_1.sendResponse)(res, 200, true, patients);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getPatients = getPatients;
const getPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const patient = yield patientService.getPatientById(id);
        (0, response_1.sendResponse)(res, 200, true, patient);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 404, false, null, error.message);
    }
});
exports.getPatient = getPatient;
const createPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = patient_validation_1.createPatientSchema.safeParse(req.body);
        if (!validation.success) {
            return (0, response_1.sendResponse)(res, 400, false, null, validation.error.errors[0].message);
        }
        const patient = yield patientService.createPatient(validation.data);
        (0, response_1.sendResponse)(res, 201, true, patient);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.createPatient = createPatient;
const updatePatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const validation = patient_validation_1.updatePatientSchema.safeParse(req.body);
        if (!validation.success) {
            return (0, response_1.sendResponse)(res, 400, false, null, validation.error.errors[0].message);
        }
        const patient = yield patientService.updatePatient(id, validation.data);
        (0, response_1.sendResponse)(res, 200, true, patient);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.updatePatient = updatePatient;
const deletePatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield patientService.deletePatient(id);
        (0, response_1.sendResponse)(res, 200, true, null);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.deletePatient = deletePatient;
