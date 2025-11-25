# Quick Start Guide - Klinik Sentosa (Windows)

## Step 1: Create Database

**Option A: Using pgAdmin (Recommended for Windows)**
1. Open **pgAdmin 4**
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `klinik_sentosa`
5. Click "Save"

**Option B: Using SQL**
1. Open **SQL Shell (psql)** from Start Menu
2. Press Enter for default values (server, database, port, username)
3. Enter your PostgreSQL password
4. Run this command:
```sql
CREATE DATABASE klinik_sentosa;
\q
```

**Option C: Using PowerShell with psql**
```powershell
# Find psql.exe location (usually in PostgreSQL bin folder)
# Example: C:\Program Files\PostgreSQL\15\bin\psql.exe

& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE klinik_sentosa;"
```

---

## Step 2: Verify Database Connection

Edit `backend\.env` if needed:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/klinik_sentosa?schema=public"
PORT=3000
JWT_SECRET="supersecretkey"
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

---

## Step 3: Setup Backend

Open PowerShell in project root:

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed

# Start backend server
npm run dev
```

**Expected:** Server running on http://localhost:3000

**Keep this terminal open!**

---

## Step 4: Setup Frontend

Open a **NEW PowerShell window**:

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

**Expected:** VITE ready at http://localhost:5173

---

## Step 5: Open Application

Open browser: **http://localhost:5173**

Login with:
- Email: `alice@klinik.com`
- Password: `password123`

---

## Troubleshooting

### "Prisma schema validation failed"
→ Check `backend\.env` has correct DATABASE_URL

### "Connection refused" or "ECONNREFUSED"
→ PostgreSQL is not running. Start it from Services or pgAdmin

### "Database does not exist"
→ Create database using Step 1 above

### "Port 3000 already in use"
→ Change PORT in `backend\.env` to 3001

---

## All Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Staff | alice@klinik.com | password123 |
| Doctor | strange@klinik.com | password123 |
| Pharmacist | pharmacist@klinik.com | password123 |
| Admin | admin@klinik.com | password123 |
