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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController = __importStar(require("../controllers/appointment.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const validate_middleware_1 = require("../middleware/validate.middleware");
const zod_1 = require("zod"); // Import z from zod
const appointment_validation_1 = require("../validation/appointment.validation");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
const reassignDoctorValidation = zod_1.z.object({
    newDoctorId: zod_1.z.number().int().positive(),
});
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointment);
router.post('/', (0, auth_middleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.STAFF]), (0, validate_middleware_1.validate)(appointment_validation_1.createAppointmentSchema), appointmentController.createAppointment);
router.put('/:id', (0, auth_middleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.STAFF, client_1.Role.DOCTOR]), (0, validate_middleware_1.validate)(appointment_validation_1.updateAppointmentSchema), appointmentController.updateAppointment);
router.post('/:id/cancel', (0, auth_middleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.STAFF]), appointmentController.cancelAppointment);
router.put('/:id/reassign-doctor', (0, auth_middleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.STAFF]), (0, validate_middleware_1.validate)(reassignDoctorValidation), appointmentController.reassignDoctor);
exports.default = router;
