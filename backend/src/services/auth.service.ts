import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const login = async (email: string, password: string, ipAddress: string, userAgent: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const updatedUser = await prisma.user.update({
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

    const token = jwt.sign(
        { id: updatedUser.id, role: updatedUser.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
    );

    return { token, user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, lastLoginAt: updatedUser.lastLoginAt } };
};
