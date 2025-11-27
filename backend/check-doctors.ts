import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDoctors() {
    try {
        console.log('Checking all doctors in database...\n');

        const doctors = await prisma.doctor.findMany({
            include: {
                user: true,
            },
            orderBy: {
                id: 'asc',
            },
        });

        console.log(`Total doctors found: ${doctors.length}\n`);

        doctors.forEach((doctor, index) => {
            console.log(`Doctor ${index + 1}:`);
            console.log(`  ID: ${doctor.id}`);
            console.log(`  User ID: ${doctor.userId}`);
            console.log(`  Name: ${doctor.user?.name || 'N/A'}`);
            console.log(`  Email: ${doctor.user?.email || 'N/A'}`);
            console.log(`  Role: ${doctor.user?.role || 'N/A'}`);
            console.log(`  Active: ${doctor.user?.isActive ? 'Yes' : 'No'}`);
            console.log(`  Specialization: ${doctor.specialization}`);
            console.log(`  Deleted At: ${doctor.deletedAt || 'Not deleted'}`);
            console.log('');
        });

        // Check with the same filter as the service
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

        console.log(`\nActive doctors (with filter): ${activeDoctors.length}`);
        activeDoctors.forEach((doctor, index) => {
            console.log(`  ${index + 1}. ${doctor.user?.name} (ID: ${doctor.id})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDoctors();
