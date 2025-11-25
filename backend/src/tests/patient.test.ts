import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Patient API', () => {
    let token: string;

    beforeAll(async () => {
        // Login as admin/staff to get token
        // Assuming seed data exists: staff / password123
        const res = await request(app).post('/api/auth/login').send({
            email: 'alice@klinik.com',
            password: 'password123',
        });
        token = res.body.data.token;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should create a new patient', async () => {
        const res = await request(app)
            .post('/api/patients')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Test Patient',
                nik: '1234567890123456',
                birthDate: '1990-01-01',
                phone: '08123456789',
                address: 'Test Address',
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('Test Patient');
    });

    it('should get all patients', async () => {
        const res = await request(app)
            .get('/api/patients')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
