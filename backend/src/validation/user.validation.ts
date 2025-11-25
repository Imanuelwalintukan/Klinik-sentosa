import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserValidation = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.nativeEnum(Role),
});

export const updateUserValidation = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z.boolean().optional(),
});

export const changePasswordValidation = z.object({
    password: z.string().min(8),
});
