"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDoctorValidation = exports.createDoctorValidation = void 0;
const zod_1 = require("zod");
exports.createDoctorValidation = zod_1.z.object({
    userId: zod_1.z.number().int().positive(),
    specialization: zod_1.z.string(),
    sip: zod_1.z.string(),
    schedule: zod_1.z.string(),
});
exports.updateDoctorValidation = zod_1.z.object({
    specialization: zod_1.z.string().optional(),
    sip: zod_1.z.string().optional(),
    schedule: zod_1.z.string().optional(),
});
