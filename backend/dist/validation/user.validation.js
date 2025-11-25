"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidation = exports.updateUserValidation = exports.createUserValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserValidation = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    role: zod_1.z.nativeEnum(client_1.Role),
});
exports.updateUserValidation = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.nativeEnum(client_1.Role).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.changePasswordValidation = zod_1.z.object({
    password: zod_1.z.string().min(8),
});
