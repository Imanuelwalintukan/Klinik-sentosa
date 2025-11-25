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
exports.deleteDrug = exports.updateDrug = exports.createDrug = exports.getDrug = exports.getDrugs = void 0;
const drugService = __importStar(require("../services/drug.service"));
const response_1 = require("../utils/response");
const drug_validation_1 = require("../validation/drug.validation");
const getDrugs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.q;
        const drugs = yield drugService.getAllDrugs(query);
        (0, response_1.sendResponse)(res, 200, true, drugs);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 500, false, null, error.message);
    }
});
exports.getDrugs = getDrugs;
const getDrug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const drug = yield drugService.getDrugById(id);
        (0, response_1.sendResponse)(res, 200, true, drug);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 404, false, null, error.message);
    }
});
exports.getDrug = getDrug;
const createDrug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validation = drug_validation_1.createDrugSchema.safeParse(req.body);
        if (!validation.success) {
            return (0, response_1.sendResponse)(res, 400, false, null, validation.error.issues[0].message);
        }
        const drug = yield drugService.createDrug(validation.data, req);
        (0, response_1.sendResponse)(res, 201, true, drug);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.createDrug = createDrug;
const updateDrug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const validation = drug_validation_1.updateDrugSchema.safeParse(req.body);
        if (!validation.success) {
            return (0, response_1.sendResponse)(res, 400, false, null, validation.error.issues[0].message);
        }
        const drug = yield drugService.updateDrug(id, validation.data, req);
        (0, response_1.sendResponse)(res, 200, true, drug);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.updateDrug = updateDrug;
const deleteDrug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield drugService.deleteDrug(id, req);
        (0, response_1.sendResponse)(res, 200, true, null);
    }
    catch (error) {
        (0, response_1.sendResponse)(res, 400, false, null, error.message);
    }
});
exports.deleteDrug = deleteDrug;
