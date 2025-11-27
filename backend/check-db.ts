import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('=== CHECKING DATABASE ===\n');

        // Check all users with DOCTOR role
        console.log('1. Users with DOCTOR role:');
        const doctorUsers = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
            },
        });
        console.log(`Found ${doctorUsers.length} users with DOCTOR role:`);
        doctorUsers.forEach((user: any, i: number) => {
            console.log(`  ${i + 1}. ${user.name} (${user.email}) - Active: ${user.isActive}`);
        });

        console.log('\n2. All Doctor records:');
        const allDoctors = await prisma.doctor.findMany({
            include: {
                user: true,
            },
        });
        console.log(`Found ${allDoctors.length} doctor records:`);
        allDoctors.forEach((doctor: any, i: number) => {
            console.log(`  ${i + 1}. Doctor ID: ${doctor.id}, User: ${doctor.user?.name || 'N/A'}, Deleted: ${doctor.deletedAt ? 'Yes' : 'No'}`);
        });

        console.log('\n3. Active doctors (matching service filter):');
        const activeDoctors = await prisma.doctor.findMany({
            where: {
                deletedAt: null,
                user: {
                    role: 'DOCTOR',
                    isActive: true,
                },
            },
            include: {
                user: true,
            },
        });
        console.log(`Found ${activeDoctors.length} active doctors:`);
        activeDoctors.forEach((doctor: any, i: number) => {
            console.log(`  ${i + 1}. ${doctor.user?.name} - Specialization: ${doctor.specialization}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
