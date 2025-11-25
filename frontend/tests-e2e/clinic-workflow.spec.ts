import { test, expect } from '@playwright/test';

// Test data
const staffCredentials = { email: 'alice@klinik.com', password: 'password123' };
const doctorCredentials = { email: 'strange@klinik.com', password: 'password123' };
const pharmacistCredentials = { email: 'pharmacist@klinik.com', password: 'password123' };

const testPatient = {
    name: 'John Doe E2E',
    nik: '9876543210123456',
    phone: '081234567890',
    address: 'Test Street 123',
    birthDate: '1990-01-15',
};

test.describe('Full Clinic Workflow', () => {
    let patientId: number;
    let appointmentId: number;
    let prescriptionId: number;

    test('1. Staff Login', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="email"]', staffCredentials.email);
        await page.fill('input[name="password"]', staffCredentials.password);
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await page.waitForURL('/');
        await expect(page.locator('text=Dashboard')).toBeVisible();
        await expect(page.locator('text=STAFF')).toBeVisible();
    });

    test('2. Create Patient', async ({ page }) => {
        // Login as staff
        await page.goto('/login');
        await page.fill('input[name="email"]', staffCredentials.email);
        await page.fill('input[name="password"]', staffCredentials.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Navigate to patients
        await page.click('text=Patients');
        await page.waitForURL('/patients');

        // Click create patient button
        await page.click('button:has-text("Add Patient")');

        // Fill patient form
        await page.fill('input[name="name"]', testPatient.name);
        await page.fill('input[name="nik"]', testPatient.nik);
        await page.fill('input[name="phone"]', testPatient.phone);
        await page.fill('input[name="address"]', testPatient.address);
        await page.fill('input[name="birthDate"]', testPatient.birthDate);

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for success message
        await expect(page.locator('text=Patient created successfully')).toBeVisible({ timeout: 5000 });

        // Verify patient appears in list
        await expect(page.locator(`text=${testPatient.name}`)).toBeVisible();

        // Extract patient ID from the table or API response
        const patientRow = page.locator(`tr:has-text("${testPatient.name}")`);
        const patientIdText = await patientRow.getAttribute('data-id');
        patientId = parseInt(patientIdText || '0');
    });

    test('3. Create Appointment', async ({ page }) => {
        // Login as staff
        await page.goto('/login');
        await page.fill('input[name="email"]', staffCredentials.email);
        await page.fill('input[name="password"]', staffCredentials.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Navigate to appointments
        await page.click('text=Appointments');
        await page.waitForURL('/appointments');

        // Click create appointment
        await page.click('button:has-text("New Appointment")');

        // Select patient (search and select)
        await page.fill('input[placeholder*="Search patient"]', testPatient.name);
        await page.click(`text=${testPatient.name}`);

        // Select doctor
        await page.selectOption('select[name="doctorId"]', { label: /Dr\. Strange/ });

        // Set date and time
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await page.fill('input[name="scheduledAt"]', `${dateStr}T10:00`);

        // Add complaint
        await page.fill('textarea[name="complaint"]', 'Fever and headache');

        // Submit
        await page.click('button[type="submit"]');

        // Verify success
        await expect(page.locator('text=Appointment created')).toBeVisible({ timeout: 5000 });

        // Extract appointment ID
        const appointmentRow = page.locator(`tr:has-text("${testPatient.name}")`).first();
        const appointmentIdText = await appointmentRow.getAttribute('data-id');
        appointmentId = parseInt(appointmentIdText || '0');
    });

    test('4. Doctor Examination and Prescription', async ({ page }) => {
        // Login as doctor
        await page.goto('/login');
        await page.fill('input[name="email"]', doctorCredentials.email);
        await page.fill('input[name="password"]', doctorCredentials.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Navigate to appointments
        await page.click('text=Appointments');
        await page.waitForURL('/appointments');

        // Find and click on the test appointment
        await page.click(`tr:has-text("${testPatient.name}") button:has-text("Examine")`);

        // Wait for examination page
        await expect(page.locator('text=Medical Examination')).toBeVisible();

        // Fill medical record
        await page.fill('textarea[name="diagnosis"]', 'Viral Fever');
        await page.fill('textarea[name="notes"]', 'Rest and hydration recommended');

        // Save medical record
        await page.click('button:has-text("Save Medical Record")');
        await expect(page.locator('text=Medical record saved')).toBeVisible({ timeout: 5000 });

        // Create prescription
        await page.click('button:has-text("Create Prescription")');

        // Add first drug
        await page.fill('input[placeholder*="Search drug"]', 'Paracetamol');
        await page.click('text=Paracetamol');
        await page.fill('input[name="items[0].qty"]', '10');
        await page.fill('input[name="items[0].dosageInstructions"]', '3x daily after meals');

        // Add second drug
        await page.click('button:has-text("Add Drug")');
        await page.fill('input[placeholder*="Search drug"]:nth-of-type(2)', 'Vitamin C');
        await page.click('text=Vitamin C');
        await page.fill('input[name="items[1].qty"]', '20');
        await page.fill('input[name="items[1].dosageInstructions"]', '1x daily');

        // Submit prescription
        await page.click('button[type="submit"]:has-text("Submit Prescription")');

        // Verify success
        await expect(page.locator('text=Prescription created')).toBeVisible({ timeout: 5000 });

        // Verify stock was decremented (check via API or UI)
        const response = await page.request.get('http://localhost:3000/api/drugs');
        const drugs = await response.json();
        const paracetamol = drugs.data.find((d: any) => d.name === 'Paracetamol');
        expect(paracetamol.stockQty).toBeLessThan(100); // Original stock was 100
    });

    test('5. Pharmacist Dispense', async ({ page }) => {
        // Login as pharmacist
        await page.goto('/login');
        await page.fill('input[name="email"]', pharmacistCredentials.email);
        await page.fill('input[name="password"]', pharmacistCredentials.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Navigate to pharmacy
        await page.click('text=Pharmacy');
        await page.waitForURL('/pharmacy');

        // Find prescription for test patient
        const prescriptionRow = page.locator(`tr:has-text("${testPatient.name}")`).first();
        await expect(prescriptionRow).toBeVisible();

        // Click prepare/dispense
        await prescriptionRow.locator('button:has-text("Prepare")').click();

        // Verify prescription details
        await expect(page.locator('text=Paracetamol')).toBeVisible();
        await expect(page.locator('text=Vitamin C')).toBeVisible();

        // Confirm dispense
        await page.click('button:has-text("Confirm Dispense")');

        // Verify success
        await expect(page.locator('text=Prescription dispensed')).toBeVisible({ timeout: 5000 });

        // Verify prescription status changed
        await expect(prescriptionRow.locator('text=DISPENSED')).toBeVisible();
    });

    test('6. Staff Complete Payment', async ({ page }) => {
        // Login as staff
        await page.goto('/login');
        await page.fill('input[name="email"]', staffCredentials.email);
        await page.fill('input[name="password"]', staffCredentials.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Navigate to payments
        await page.click('text=Payments');
        await page.waitForURL('/payments');

        // Find pending payment for test patient
        const paymentRow = page.locator(`tr:has-text("${testPatient.name}")`).first();
        await expect(paymentRow).toBeVisible();

        // Click process payment
        await paymentRow.locator('button:has-text("Process Payment")').click();

        // Verify total amount is calculated
        await expect(page.locator('text=Total Amount')).toBeVisible();

        // Select payment method
        await page.selectOption('select[name="method"]', 'CASH');

        // Confirm payment
        await page.click('button:has-text("Confirm Payment")');

        // Verify success
        await expect(page.locator('text=Payment completed')).toBeVisible({ timeout: 5000 });

        // Verify receipt is generated
        await expect(page.locator('text=Receipt')).toBeVisible();
        await expect(page.locator(`text=${testPatient.name}`)).toBeVisible();

        // Verify payment status
        await page.click('text=Payments');
        await expect(page.locator(`tr:has-text("${testPatient.name}") text=PAID`)).toBeVisible();
    });
});
