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
exports.deleteDoctor = exports.updateDoctor = exports.createDoctor = exports.getDoctorById = exports.getAllDoctors = void 0;
const response_1 = require("../utils/response");
const doctorService = __importStar(require("../services/doctor.service"));
const getAllDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, page, limit } = req.query;
        const filters = {
            search: search ? String(search) : undefined,
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
        };
        const doctors = yield doctorService.getAllDoctors(filters);
        (0, response_1.sendResponse)(res, 200, true, doctors);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getAllDoctors = getAllDoctors;
const getDoctorById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const doctor = yield doctorService.getDoctorById(id);
        if (!doctor) {
            return (0, response_1.sendResponse)(res, 404, false, null, 'Doctor not found');
        }
        (0, response_1.sendResponse)(res, 200, true, doctor);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getDoctorById = getDoctorById;
const createDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newDoctor = yield doctorService.createDoctor(req.body, req);
        (0, response_1.sendResponse)(res, 201, true, newDoctor);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.createDoctor = createDoctor;
const updateDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedDoctor = yield doctorService.updateDoctor(id, req.body, req);
        (0, response_1.sendResponse)(res, 200, true, updatedDoctor);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.updateDoctor = updateDoctor;
const deleteDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const deletedDoctor = yield doctorService.deleteDoctor(id, req);
        (0, response_1.sendResponse)(res, 200, true, deletedDoctor);
    }
    catch (error) { // Cast error to any
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.deleteDoctor = deleteDoctor;
