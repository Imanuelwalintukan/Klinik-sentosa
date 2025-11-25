import { Request, Response } from 'express';
import { sendResponse } from '../utils/response';
import * as userService from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { search, role, isActive, page, limit } = req.query;

        const filters = {
            search: search ? String(search) : undefined,
            role: role ? String(role) : undefined,
            isActive: isActive !== undefined ? String(isActive).toLowerCase() === 'true' : undefined,
            page: page ? parseInt(String(page)) : undefined,
            limit: limit ? parseInt(String(limit)) : undefined,
        };

        const users = await userService.getAllUsers(filters);
        sendResponse(res, 200, true, users);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const user = await userService.getUserById(id);
        if (!user) {
            return sendResponse(res, 404, false, null, 'User not found');
        }
        sendResponse(res, 200, true, user);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        const newUser = await userService.createUser(req.body, req);
        sendResponse(res, 201, true, newUser);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const updatedUser = await userService.updateUser(id, req.body, req);
        sendResponse(res, 200, true, updatedUser);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const deletedUser = await userService.deleteUser(id, req);
        sendResponse(res, 200, true, deletedUser);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { password } = req.body;
        const updatedUser = await userService.changePassword(id, password, req);
        sendResponse(res, 200, true, updatedUser);
    } catch (error: any) { // Cast error to any
        sendResponse(res, 500, false, null, error.message);
    }
};

export const restoreUser = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const restoredUser = await userService.restoreUser(id, req);
        sendResponse(res, 200, true, restoredUser);
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

