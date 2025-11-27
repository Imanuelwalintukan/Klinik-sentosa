import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'doctor@klinik.com';
    const passwordHash = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            name: 'Dr. Manual',
            email,
            passwordHash,
            role: Role.DOCTOR,
        },
    });

    const doctor = await prisma.doctor.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            specialization: 'General',
            sip: 'SIP-MANUAL',
            schedule: 'Daily',
        },
    });

    console.log('Created doctor:', doctor);
}

main().finally(() => prisma.$disconnect());
