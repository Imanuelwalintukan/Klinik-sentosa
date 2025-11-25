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
exports.reassignDoctor = exports.cancelAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointment = exports.getAppointments = void 0;
const appointmentService = __importStar(require("../services/appointment.service"));
const response_1 = require("../utils/response");
const appointment_validation_1 = require("../validation/appointment.validation");
const getAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = req.query.date;
        const doctorId = req.query.doctorId ? parseInt(req.query.doctorId) : undefined;
        const appointments = yield appointmentService.getAppointments(date, doctorId, req.user);
        (0, response_1.sendResponse)(res, 200, true, appointments);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getAppointments = getAppointments;
const getAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const appointment = yield appointmentService.getAppointmentById(id);
        (0, response_1.sendResponse)(res, 200, true, appointment);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 404, false, null, error.message);
    }
});
exports.getAppointment = getAppointment;
const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = appointment_validation_1.createAppointmentSchema.safeParse(req.body);
        if (!validation.success) {
            return (0, response_1.sendResponse)(res, 400, false, null, validation.error.issues[0].message);
        }
        if (!req.user)
            return (0, response_1.sendResponse)(res, 401, false, null, 'Unauthorized');
        const appointment = yield appointmentService.createAppointment(validation.data, req);
        (0, response_1.sendResponse)(res, 201, true, appointment);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.createAppointment = createAppointment;
const updateAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const validation = appointment_validation_1.updateAppointmentSchema.safeParse(req.body);
        if (!validation.success) {
            return (0, response_1.sendResponse)(res, 400, false, null, validation.error.issues[0].message);
        }
        const appointment = yield appointmentService.updateAppointment(id, validation.data, req);
        (0, response_1.sendResponse)(res, 200, true, appointment);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.updateAppointment = updateAppointment;
const cancelAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const cancelledAppointment = yield appointmentService.cancelAppointment(id, req);
        (0, response_1.sendResponse)(res, 200, true, cancelledAppointment);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.cancelAppointment = cancelAppointment;
const reassignDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { newDoctorId } = req.body;
        const reassignedAppointment = yield appointmentService.reassignDoctor(id, newDoctorId, req);
        (0, response_1.sendResponse)(res, 200, true, reassignedAppointment);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.reassignDoctor = reassignDoctor;
