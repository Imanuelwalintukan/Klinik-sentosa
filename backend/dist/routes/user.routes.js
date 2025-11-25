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
const validate_middleware_1 = require("../middleware/validate.middleware");
const userController = __importStar(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_validation_1 = require("../validation/user.validation");
const router = (0, express_1.Router)();
router.get('/', [auth_middleware_1.authenticate, auth_middleware_1.isAdmin], userController.getAllUsers);
router.get('/:id', [auth_middleware_1.authenticate, auth_middleware_1.isAdmin], userController.getUserById);
router.post('/', [auth_middleware_1.authenticate, auth_middleware_1.isAdmin, (0, validate_middleware_1.validate)(user_validation_1.createUserValidation)], userController.createUser);
router.put('/:id', [auth_middleware_1.authenticate, auth_middleware_1.isAdmin, (0, validate_middleware_1.validate)(user_validation_1.updateUserValidation)], userController.updateUser);
router.delete('/:id', [auth_middleware_1.authenticate, auth_middleware_1.isAdmin], userController.deleteUser);
router.post('/:id/restore', [auth_middleware_1.authenticate, auth_middleware_1.isAdmin], userController.restoreUser);
router.post('/:id/change-password', [auth_middleware_1.authenticate, auth_middleware_1.isAdmin, (0, validate_middleware_1.validate)(user_validation_1.changePasswordValidation)], userController.changePassword);
router.post('/:id/change-role', [auth_middleware_1.authenticate, auth_middleware_1.isAdmin], userController.changeUserRole);
router.post('/:id/toggle-activation', [auth_middleware_1.authenticate, auth_middleware_1.isAdmin], userController.toggleUserActivation);
exports.default = router;
