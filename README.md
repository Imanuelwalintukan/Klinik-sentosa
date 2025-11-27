# 🏥 Klinik Sentosa - Clinic Management System

## 1. 🔹 Project Overview

**Klinik Sentosa** is a robust, full-stack clinic management system designed to digitize and streamline the entire patient journey—from registration to diagnosis, medication dispensing, and billing. It serves as a centralized platform for all clinic staff and provides a dedicated portal for patients.

### 👥 User Roles
*   **Admin:** Complete system oversight, user/doctor management, and financial reporting.
*   **Staff (Receptionist):** Front-desk operations, patient registration, appointment scheduling, and payment processing.
*   **Doctor:** Clinical operations, patient examination, digital diagnosis, and prescribing.
*   **Pharmacist:** Medication management, prescription preparation, dispensing, and stock control.
*   **Customer (Patient):** Personal portal to track queue status, view medical history, and access digital receipts.

---

## 2. 🔄 Full Program Flow

The system is designed around a seamless, linear workflow that ensures data integrity and operational efficiency.

### 📝 Step-by-Step Workflow Story

1.  **Appointment Booking (Staff):**
    *   A patient arrives or calls. The **Staff** logs in and navigates to *Appointments*.
    *   They select the patient and doctor, creating a new appointment.
    *   **System:** Generates a Queue Number (e.g., #005) and sets status to `PENDING`.

2.  **Patient Arrival (Staff):**
    *   When the patient arrives at the clinic, **Staff** marks the appointment as `PATIENT_ARRIVED`.
    *   **System:** Updates the live queue; the patient can see their status on the *Customer Portal*.

3.  **Examination & Diagnosis (Doctor):**
    *   The **Doctor** sees the patient in their queue and clicks *Examine*.
    *   They record the **Diagnosis** and medical notes.
    *   **System:** Creates a `MedicalRecord` and updates appointment status to `COMPLETED`.

4.  **Prescribing Medication (Doctor):**
    *   From the examination screen, the **Doctor** creates a **Prescription**.
    *   They add drugs (e.g., "Amoxicillin", "Paracetamol") with specific dosages.
    *   **System:** Sends the prescription to the Pharmacy Queue with status `PENDING`. *Note: Stock is not deducted yet.*

5.  **Preparation (Pharmacist):**
    *   The **Pharmacist** sees the new order in the *Pharmacy Queue*.
    *   They click *Prepare* to validate stock availability.
    *   **System:** Checks inventory. If sufficient, updates status to `PREPARED`.

6.  **Dispensing (Pharmacist):**
    *   Once physically ready, the **Pharmacist** clicks *Dispense*.
    *   **System:**
        *   **Deducts Stock:** Inventory counts are reduced in real-time.
        *   **Creates Payment:** A bill is auto-generated containing the Appointment Fee + Prescription Cost.
        *   **Updates Status:** Prescription becomes `DISPENSED`.

7.  **Payment Processing (Staff):**
    *   The **Staff** sees the new bill in the *Payments* section.
    *   They process the payment (Cash/Card/QRIS) and mark it as `PAID`.
    *   **System:** Moves the transaction to history and generates a receipt.

8.  **Customer Access (Customer):**
    *   The **Patient** logs into the *Customer Portal*.
    *   They can view their past diagnoses, prescription details, and download the official receipt.

### mermaid Flow Diagram

```mermaid
graph TD
    subgraph Reception
    A[Staff Creates Appointment] -->|Status: PENDING| B[Patient Arrives]
    B -->|Status: PATIENT_ARRIVED| C[Doctor Queue]
    end

    subgraph Clinical
    C -->|Doctor Examines| D[Create Medical Record]
    D -->|Status: COMPLETED| E[Create Prescription]
    end

    subgraph Pharmacy
    E -->|Status: PENDING| F[Pharmacist Prepares]
    F -->|Status: PREPARED| G[Pharmacist Dispenses]
    G -->|Stock Deducted| H[Auto-Create Payment]
    end

    subgraph Finance
    H -->|Status: PENDING| I[Staff Processes Payment]
    I -->|Status: PAID| J[Transaction Complete]
    end

    subgraph Customer_Portal
    K[View Queue]
    L[View History]
    M[Download Receipt]
    end
```

---

## 3. 🔑 Role-Based Features

| Role | Permissions & Features |
| :--- | :--- |
| **ADMIN** | • **User Management:** Create/Edit users, assign roles.<br>• **Doctor Management:** Manage profiles & schedules.<br>• **Reports:** View financial analytics & logs.<br>• **Full Access:** Can access all modules except personal medical entry. |
| **STAFF** | • **Registration:** Add new patients.<br>• **Appointments:** Schedule & manage queue.<br>• **Payments:** Process bills & view history.<br>• **Dashboard:** View clinic overview. |
| **DOCTOR** | • **Examination:** Access assigned patient queue.<br>• **Medical Records:** Write diagnoses & notes.<br>• **Prescriptions:** Issue medications.<br>• **History:** View patient medical background. |
| **PHARMACIST**| • **Pharmacy Queue:** Manage prescription workflow.<br>• **Inventory:** Add drugs, update stock, monitor expiry.<br>• **Dispense:** Validate stock & trigger billing. |
| **CUSTOMER** | • **Dashboard:** View live queue status.<br>• **Medical History:** View past visits (read-only).<br>• **Prescriptions:** See medication instructions.<br>• **Payments:** View bills & download receipts. |

---

## 4. 🔗 Module-to-Module Interaction

*   **Appointment ➔ Medical Record:** An appointment must exist and be in progress for a Medical Record to be created. The record links back to the appointment.
*   **Medical Record ➔ Prescription:** A prescription is strictly tied to a specific medical record (diagnosis).
*   **Prescription ➔ Inventory:** Dispensing a prescription directly mutates the `Drug` table (decrements `stockQty`).
*   **Prescription ➔ Payment:** The act of dispensing triggers the creation of a `Payment` record. The system calculates the total cost (Consultation Fee + Σ(Drug Price × Qty)).
*   **Payment ➔ Reports:** Completed payments are aggregated into daily/monthly financial reports accessible by Admins.

---

## 5. 🚀 Installation & Setup

### Backend Setup
1.  **Navigate:** `cd backend`
2.  **Install:** `npm install`
3.  **Env:** Create `.env` with:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/klinik_sentosa?schema=public"
    JWT_SECRET="your_secret_key"
    PORT=3000
    ```
4.  **Database:**
    ```bash
    npx prisma migrate dev
    npx prisma db seed  # CRITICAL: Seeds default users
    ```
5.  **Run:** `npm run dev`

### Frontend Setup
1.  **Navigate:** `cd frontend`
2.  **Install:** `npm install`
3.  **Run:** `npm run dev`

---

## 6. 🔐 How to Login (Seeded Users)

The system comes pre-seeded with the following accounts for testing. The password for **ALL** accounts is `password123`.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@klinik.com` | `password123` |
| **Staff** | `alice@klinik.com` | `password123` |
| **Doctor** | `strange@klinik.com` | `password123` |
| **Doctor** | `house@klinik.com` | `password123` |
| **Pharmacist**| `pharmacist@klinik.com`| `password123` |
| **Customer** | `customer1@example.com`| `password123` |

---

## 7. 🗄️ Database Schema (ERD)

Based on the Prisma schema, here is the entity relationship structure:

```mermaid
erDiagram
    User ||--o| Doctor : "is a"
    User ||--o| Patient : "linked to (Customer)"
    User ||--o{ Appointment : "created by"
    
    Doctor ||--o{ Appointment : "assigned to"
    Doctor ||--o{ Prescription : "issues"
    
    Patient ||--o{ Appointment : "has"
    
    Appointment ||--|| MedicalRecord : "results in"
    Appointment ||--|| Payment : "billed as"
    
    MedicalRecord ||--|| Prescription : "may have"
    
    Prescription ||--|{ PrescriptionItem : "contains"
    PrescriptionItem }|--|| Drug : "references"
    
    Drug ||--o{ StockAuditLog : "tracked by"
```

---

## 8. 📍 API & Page Index

### Frontend Navigation Paths
*   `/login` - Authentication
*   `/admin/dashboard` - Admin Overview
*   `/admin/users` - User Management
*   `/patients` - Patient List & Registration
*   `/appointments` - Appointment Scheduling & Queue
*   `/examination/:id` - Doctor Examination Interface
*   `/pharmacy` - Prescription Processing
*   `/inventory` - Drug Stock Management
*   `/payments` - Billing & Transaction History
*   `/customer/dashboard` - Patient Portal Home

### Key Backend API Routes
*   **Auth:** `POST /api/auth/login`
*   **Users:** `GET /api/users`, `POST /api/users`
*   **Appointments:** `GET /api/appointments`, `POST /api/appointments`
*   **Medical Records:** `POST /api/medical-records`
*   **Prescriptions:** `POST /api/prescriptions`, `PUT /api/prescriptions/:id/status`
*   **Drugs:** `GET /api/drugs`, `POST /api/drugs`
*   **Payments:** `GET /api/payments`, `PUT /api/payments/appointment/:id/status`
