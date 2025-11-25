import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import doctorRoutes from './routes/doctor.routes';
import patientRoutes from './routes/patient.routes';
import drugRoutes from './routes/drug.routes';
import appointmentRoutes from './routes/appointment.routes';
import medicalRecordRoutes from './routes/medical-record.routes';
import prescriptionRoutes from './routes/prescription.routes';
import paymentRoutes from './routes/payment.routes';
import adminDashboardRoutes from './routes/admin-dashboard.routes';
import systemLogRoutes from './routes/system-log.routes';
import customerRoutes from './routes/customer.routes';
import stockMonitoringRoutes from './routes/stock-monitoring.routes';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(loggerMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stock-monitoring', stockMonitoringRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/activity-logs', systemLogRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Klinik Sentosa API' });
});

app.use(errorHandler);

export default app;
