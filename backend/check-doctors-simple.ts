import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        // 1. Check active doctors (what should appear in dropdown)
        const activeDoctors = await prisma.doctor.findMany({
            where: {
                deletedAt: null,
                user: {
                    role: 'DOCTOR',
                    isActive: true,
                },
            },
            include: { user: true },
        });

        console.log(`Active Doctors (Dropdown Candidates): ${activeDoctors.length}`);
        activeDoctors.forEach((d: any) => console.log(`- ${d.user.name} (ID: ${d.id})`));

        // 2. Check users with role DOCTOR but NO doctor record
        const orphanedUsers = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                isActive: true,
                doctor: null, // No doctor record
            },
        });

        console.log(`\nOrphaned Doctor Users (Role=DOCTOR but not in Doctor table): ${orphanedUsers.length}`);
        orphanedUsers.forEach((u: any) => console.log(`- ${u.name} (ID: ${u.id})`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
