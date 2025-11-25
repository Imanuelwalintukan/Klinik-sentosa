import { PrismaClient, Role, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Clean up database
  await prisma.appointment.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared previous data.');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Users
  console.log('Seeding users...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@klinik.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@klinik.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const staff1 = await prisma.user.upsert({
    where: { email: 'alice@klinik.com' },
    update: {},
    create: { name: 'Staff Alice', email: 'alice@klinik.com', passwordHash, role: Role.STAFF },
  });

  const docUser1 = await prisma.user.upsert({
    where: { email: 'strange@klinik.com' },
    update: {},
    create: { name: 'Dr. Strange', email: 'strange@klinik.com', passwordHash, role: Role.DOCTOR },
  });

  const docUser2 = await prisma.user.upsert({
    where: { email: 'house@klinik.com' },
    update: {},
    create: { name: 'Dr. House', email: 'house@klinik.com', passwordHash, role: Role.DOCTOR },
  });

  const docUser3 = await prisma.user.upsert({
    where: { email: 'who@klinik.com' },
    update: {},
    create: { name: 'Dr. Who', email: 'who@klinik.com', passwordHash, role: Role.DOCTOR },
  });

  const pharmacistUser = await prisma.user.upsert({
    where: { email: 'pharmacist@klinik.com' },
    update: {},
    create: { name: 'Pharmacist Phil', email: 'pharmacist@klinik.com', passwordHash, role: Role.PHARMACIST },
  });
  console.log('Users seeded.');


  // 2. Seed Doctors
  console.log('Seeding doctors...');
  const doctor1 = await prisma.doctor.upsert({
    where: { userId: docUser1.id },
    update: { specialization: 'General Practitioner', sip: 'SIP123', schedule: 'Mon-Fri, 9-5' },
    create: { userId: docUser1.id, specialization: 'General Practitioner', sip: 'SIP123', schedule: 'Mon-Fri, 9-5' },
  });
  const doctor2 = await prisma.doctor.upsert({
    where: { userId: docUser2.id },
    update: { specialization: 'Diagnostician', sip: 'SIP456', schedule: 'Mon-Wed, 9-5' },
    create: { userId: docUser2.id, specialization: 'Diagnostician', sip: 'SIP456', schedule: 'Mon-Wed, 9-5' },
  });
  const doctor3 = await prisma.doctor.upsert({
    where: { userId: docUser3.id },
    update: { specialization: 'Time Lord', sip: 'SIP789', schedule: 'Anytime' },
    create: { userId: docUser3.id, specialization: 'Time Lord', sip: 'SIP789', schedule: 'Anytime' },
  });
  console.log('Doctors seeded.');

  // 3. Seed Patients
  console.log('Seeding patients...');
  await prisma.patient.deleteMany();
  const patientsData = Array.from({ length: 10 }).map((_, i) => ({
    name: `Patient ${i + 1}`,
    nik: `1234567890${i}`,
    phone: `0812345678${i}`,
    address: `Jalan Sehat No. ${i + 1}`,
    birthDate: new Date(1990, 0, i + 1),
  }));

  const patients = [];
  for (const p of patientsData) {
    const patient = await prisma.patient.create({ data: p }); // create is fine after deleteMany
    patients.push(patient);
  }
  console.log('Patients seeded.');

  // 3.5. Seed Customer Users (linked to patients)
  console.log('Seeding customer users...');
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      name: patients[0].name,
      email: 'customer1@example.com',
      passwordHash,
      role: Role.CUSTOMER,
      patientId: patients[0].id,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      name: patients[1].name,
      email: 'customer2@example.com',
      passwordHash,
      role: Role.CUSTOMER,
      patientId: patients[1].id,
    },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: 'customer3@example.com' },
    update: {},
    create: {
      name: patients[2].name,
      email: 'customer3@example.com',
      passwordHash,
      role: Role.CUSTOMER,
      patientId: patients[2].id,
    },
  });
  console.log('Customer users seeded.');

  // 4. Seed Drugs
  console.log('Seeding drugs...');
  await prisma.drug.deleteMany();
  const drugsData = Array.from({ length: 10 }).map((_, i) => ({
    name: `Drug ${String.fromCharCode(65 + i)}`,
    sku: `SKU-${100 + i}`,
    unitPrice: (i + 1) * 5000,
    stockQty: 100,
    minStock: 20,
    expiryDate: new Date(2026, 0, 1),
  }));

  for (const d of drugsData) {
    await prisma.drug.create({ data: d }); // create is fine after deleteMany
  }
  console.log('Drugs seeded.');

  // 5. Seed Appointments
  console.log('Seeding appointments...');
  await prisma.appointment.deleteMany();
  const appointmentsData = [
    { patientId: patients[0].id, doctorId: doctor1.id, scheduledAt: new Date(), status: AppointmentStatus.PENDING, complaint: 'Fever' },
    { patientId: patients[1].id, doctorId: doctor1.id, scheduledAt: new Date(), status: AppointmentStatus.CONFIRMED, complaint: 'Cough' },
    { patientId: patients[2].id, doctorId: doctor2.id, scheduledAt: new Date(), status: AppointmentStatus.COMPLETED, complaint: 'Leg pain' },
    { patientId: patients[3].id, doctorId: doctor3.id, scheduledAt: new Date(), status: AppointmentStatus.PENDING, complaint: 'Headache' },
    { patientId: patients[4].id, doctorId: doctor2.id, scheduledAt: new Date(), status: AppointmentStatus.CANCELLED, complaint: 'Checkup' },
  ];

  for (let i = 0; i < appointmentsData.length; i++) {
    await prisma.appointment.create({
      data: {
        ...appointmentsData[i],
        queueNumber: i + 1,
        createdById: staff1.id,
      },
    });
  }
  console.log('Appointments seeded.');

  console.log('Seed data inserted successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
