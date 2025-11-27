import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOrphanedDoctors() {
    try {
        console.log('=== FIXING ORPHANED DOCTORS ===\n');

        // 1. Find users with role DOCTOR but no Doctor record
        const orphanedUsers = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctor: null,
            },
        });

        console.log(`Found ${orphanedUsers.length} orphaned doctor users.`);

        if (orphanedUsers.length === 0) {
            console.log('No orphaned doctors found. Everything looks good!');
            return;
        }

        // 2. Create Doctor records for them
        console.log('Creating Doctor records...');

        for (const user of orphanedUsers) {
            // Use any to bypass potential type mismatches in the generated client
            const newDoctor = await prisma.doctor.create({
                data: {
                    userId: user.id,
                    specialization: 'General', // Default specialization
                } as any,
            });
            console.log(`✅ Created Doctor record for user: ${user.name} (ID: ${user.id}) -> Doctor ID: ${newDoctor.id}`);
        }

        console.log('\nAll orphaned doctors have been fixed!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixOrphanedDoctors();
