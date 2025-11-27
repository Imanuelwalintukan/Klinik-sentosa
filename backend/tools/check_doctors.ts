import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const doctors = await prisma.doctor.findMany({ include: { user: true } });
    console.log('Doctors in DB:', JSON.stringify(doctors, null, 2));
}
main().finally(() => prisma.$disconnect());
