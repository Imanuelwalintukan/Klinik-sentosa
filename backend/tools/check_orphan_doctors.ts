import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Get all users with role DOCTOR
    const doctorUsers = await prisma.user.findMany({
        where: { role: Role.DOCTOR },
        include: { doctor: true },
    });

    console.log(`Total Users with Role DOCTOR: ${doctorUsers.length}`);

    const orphans = doctorUsers.filter(u => !u.doctor);

    if (orphans.length > 0) {
        console.log('Orphan Doctor Users (No Doctor Profile):');
        orphans.forEach(u => console.log(`- [${u.id}] ${u.name} (${u.email})`));
    } else {
        console.log('All doctor users have profiles.');
    }

    // 2. Check total doctors in Doctor table
    const totalDoctors = await prisma.doctor.count();
    console.log(`Total Doctor Records: ${totalDoctors}`);
}

main().finally(() => prisma.$disconnect());
