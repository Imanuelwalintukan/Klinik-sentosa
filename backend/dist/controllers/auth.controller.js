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
exports.loginController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
const auth_validation_1 = require("../validation/auth.validation");
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = auth_validation_1.loginSchema.safeParse(req.body);
        if (!validation.success) {
            return (0, response_1.sendResponse)(res, 400, false, null, validation.error.issues[0].message);
        }
        const { email, password } = validation.data;
        const result = yield (0, auth_service_1.login)(email, password);
        (0, response_1.sendResponse)(res, 200, true, result);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 401, false, null, error.message);
    }
});
exports.loginController = loginController;
