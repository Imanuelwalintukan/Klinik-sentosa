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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const login = (email, password, ipAddress, userAgent) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    if (!user.isActive) {
        throw new Error('Account is inactive. Please contact support.');
    }
    const isMatch = yield bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }
    const updatedUser = yield prisma.user.update({
        where: { id: user.id },
        data: {
            lastLoginAt: new Date(),
            loginHistory: {
                create: {
                    ipAddress,
                    userAgent,
                },
            },
        },
    });
    const token = jsonwebtoken_1.default.sign({ id: updatedUser.id, role: updatedUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    return { token, user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, lastLoginAt: updatedUser.lastLoginAt } };
});
exports.login = login;
