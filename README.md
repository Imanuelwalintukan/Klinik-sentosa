# Klinik Sentosa

Full-stack clinic management system built with Node.js, Express, TypeScript, Prisma, PostgreSQL, React, and Tailwind CSS.

## 🏥 Features

- **Patient Management**: Register, search, edit patient records
- **Appointment Scheduling**: Book appointments with doctors, manage daily queue
- **Doctor Examination**: Create medical records with diagnosis and notes
- **Prescription Management**: Create prescriptions with automatic stock management (transactional)
- **Pharmacy Workflow**: Prepare and dispense medications
- **Payment Processing**: Handle payments with multiple methods (Cash, Card, QRIS)
- **Drug Inventory**: Manage drug stock with low-stock warnings
- **Role-based Access**: Admin, Doctor, Pharmacist, Staff roles with specific permissions

## 🛠️ Tech Stack

**Backend:**
- Node.js 18+ with Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod Validation
- Jest (Unit Tests)

**Frontend:**
- React 19 with Vite
- TypeScript
- Tailwind CSS
- React Router
- React Hook Form
- Playwright (E2E Tests)

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm or yarn

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd klinik-sentosa
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/klinik_sentosa?schema=public"
PORT=3000
JWT_SECRET="your-secret-key-here"
```

Run database migrations:

```bash
npx prisma migrate dev --name init
```

Seed the database:

```bash
npx prisma db seed
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend dev server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 👥 Default Users

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@klinik.com | password123 |
| Doctor | strange@klinik.com | password123 |
| Pharmacist | pharmacist@klinik.com | password123 |
| Staff | alice@klinik.com | password123 |

## 🧪 Testing

### Backend Unit Tests

```bash
cd backend
npm test
```

### Frontend E2E Tests

```bash
cd frontend
npx playwright test
```

### Rubric Validation

Run the automated rubric checker:

```bash
cd tools
npm install
npm run check
```

This will generate a report at `docs/rubric-report.md` showing which rubric criteria are met.

## 📁 Project Structure

```
klinik-sentosa/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, logging, errors
│   │   ├── validation/      # Zod schemas
│   │   └── tests/           # Jest unit tests
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── seed.ts          # Sample data
│   │   └── migrations/      # Database migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   └── services/        # API client
│   ├── tests-e2e/           # Playwright tests
│   └── package.json
├── tools/
│   └── rubric-checker.js    # Validation script
└── docs/
    ├── mapping.md           # Use case mapping
    └── rubric-report.md     # Validation report
```

## 🔑 Key Features Implementation

### Transactional Prescription Creation

The prescription creation process uses Prisma transactions to ensure data consistency:

1. Creates prescription record
2. Creates prescription items
3. Decrements drug stock atomically
4. Rolls back entire transaction if any step fails (e.g., insufficient stock)

See: `backend/src/services/prescription.service.ts`

### Role-based Access Control

All protected routes use JWT authentication and role-based middleware:

```typescript
router.post('/', authenticate, authorize([Role.ADMIN, Role.STAFF]), createPatient);
```

### API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## 📚 Documentation

- [Use Case Mapping](docs/mapping.md) - Maps use cases to implementation
- [Rubric Report](docs/rubric-report.md) - Validation against rubric criteria

## 🐛 Troubleshooting

**Database connection error:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists: `createdb klinik_sentosa`

**Port already in use:**
- Backend: Change `PORT` in `.env`
- Frontend: Vite will auto-increment port

**Prisma client errors:**
- Run `npx prisma generate` in backend directory

## 📝 License

This project is for educational purposes.
