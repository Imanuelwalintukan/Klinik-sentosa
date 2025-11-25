// Completed by Antigravity AI — Frontend Completion

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'DOCTOR' | 'PHARMACIST' | 'STAFF' | 'CUSTOMER';
    isActive: boolean;
    patientId?: number;
    patient?: Patient;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    deletedAt?: string;
    loginHistory?: {
        timestamp: string;
        ipAddress: string;
        userAgent: string;
    }[];
}

export interface PaginatedUsersResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
}

export interface Patient {
    id: number;
    name: string;
    nik: string;
    phone: string;
    address: string;
    birthDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface Doctor {
    id: number;
    userId: number;
    specialization: string;
    user?: User; // User relation should be here
    sip: string;
    schedule: string;
    deletedAt?: string;
}

export interface PaginatedDoctorsResponse {
    doctors: Doctor[];
    total: number;
    page: number;
    limit: number;
}

export interface Appointment {
    id: number;
    patientId: number;
    doctorId: number;
    scheduledAt: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    queueNumber: number;
    complaint?: string;
    createdById: number;
    patient?: Patient;
    doctor?: Doctor;
    createdBy?: User;
    createdAt: string;
    updatedAt: string;
}

export interface MedicalRecord {
    id: number;
    appointmentId: number;
    patientId: number;
    doctorId: number;
    diagnosis: string;
    notes?: string;
    appointment?: Appointment;
    patient?: Patient;
    doctor?: Doctor;
    createdAt: string;
}

export interface Drug {
    id: number;
    name: string;
    sku: string;
    unitPrice: number;
    stockQty: number;
    expiryDate?: string;
    minStock?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface PrescriptionItem {
    id: number;
    prescriptionId: number;
    drugId: number;
    qty: number;
    dosageInstructions: string;
    drug?: Drug;
}

export interface Prescription {
    id: number;
    medicalRecordId: number;
    doctorId: number;
    status: 'PENDING' | 'PREPARED' | 'DISPENSED';
    medicalRecord?: MedicalRecord;
    doctor?: Doctor;
    items?: PrescriptionItem[];
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: number;
    appointmentId: number;
    amount: number;
    appointmentFee?: number;
    prescriptionFee?: number;
    method: 'CASH' | 'CARD' | 'QRIS';
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    appointment?: Appointment;
    createdAt: string;
    updatedAt?: string;
}

export interface ActivityLog {
    id: number;
    userId: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    action: string;
    entity: string;
    entityId: number;
    oldValue: unknown;
    newValue: unknown;
    timestamp: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface DashboardStats {
    todayAppointments: number;
    pendingPrescriptions: number;
    lowStockDrugs: number;
    pendingPayments: number;
    totalPatients?: number;
    totalAppointments?: number;
    totalPrescriptions?: number;
    activeDoctors?: number;
    totalRevenue?: number;
}

// Customer Portal Types
export interface CustomerQueue {
    appointment: Appointment;
    queueNumber: number;
    position: number;
    estimatedWaitTime: number;
}

export interface CustomerProfile {
    user: User;
    patient: Patient;
}

export interface StockAlert {
    id: number;
    name: string;
    sku: string;
    stockQty: number;
    minStock?: number;
    expiryDate?: string;
}

export interface StockAuditLog {
    id: number;
    drugId: number;
    drug: Drug;
    action: string;
    quantity: number;
    oldStock: number;
    newStock: number;
    reason?: string;
    userId: number;
    timestamp: string;
}

export interface StockSummary {
    totalDrugs: number;
    lowStockCount: number;
    expiringCount: number;
    totalStockQuantity: number;
    lowStockDrugs: Drug[];
    expiringDrugs: Drug[];
}