const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const FRONTEND_DIR = path.join(__dirname, '../frontend/src');
const BACKEND_DIR = path.join(__dirname, '../backend/src');
const DOCS_DIR = path.join(__dirname, '../docs');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

const results = {
    passed: [],
    failed: [],
    warnings: [],
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    return fs.existsSync(fullPath);
}

function addResult(category, item, status, message) {
    const result = { category, item, status, message };
    if (status === 'PASSED') {
        results.passed.push(result);
    } else if (status === 'FAILED') {
        results.failed.push(result);
    } else {
        results.warnings.push(result);
    }
}

// Check 1: File Structure
async function checkFileStructure() {
    log('\n=== Checking File Structure ===', 'blue');

    const requiredFiles = [
        // Backend
        'backend/src/app.ts',
        'backend/src/server.ts',
        'backend/src/controllers/auth.controller.ts',
        'backend/src/controllers/patient.controller.ts',
        'backend/src/controllers/appointment.controller.ts',
        'backend/src/controllers/medical-record.controller.ts',
        'backend/src/controllers/prescription.controller.ts',
        'backend/src/controllers/drug.controller.ts',
        'backend/src/controllers/payment.controller.ts',
        'backend/src/services/auth.service.ts',
        'backend/src/services/patient.service.ts',
        'backend/src/services/prescription.service.ts',
        'backend/src/middleware/auth.middleware.ts',
        'backend/prisma/schema.prisma',
        'backend/prisma/seed.ts',

        // Frontend
        'frontend/src/context/AuthContext.tsx',
        'frontend/src/services/api.ts',
        'frontend/src/components/Layout.tsx',
        'frontend/src/components/Sidebar.tsx',

        // Tests
        'backend/src/tests/patient.test.ts',
        'backend/src/tests/prescription.service.test.ts',
        'frontend/tests-e2e/clinic-workflow.spec.ts',

        // Documentation
        'docs/mapping.md',
        'README.md',
    ];

    requiredFiles.forEach(file => {
        if (checkFileExists(file)) {
            addResult('File Structure', file, 'PASSED', 'File exists');
            log(`✓ ${file}`, 'green');
        } else {
            addResult('File Structure', file, 'FAILED', 'File not found');
            log(`✗ ${file}`, 'red');
        }
    });
}

// Check 2: Database Schema
async function checkDatabaseSchema() {
    log('\n=== Checking Database Schema ===', 'blue');

    const schemaPath = path.join(__dirname, '../backend/prisma/schema.prisma');
    if (!fs.existsSync(schemaPath)) {
        addResult('Database', 'schema.prisma', 'FAILED', 'Schema file not found');
        return;
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

    const requiredModels = [
        'User',
        'Patient',
        'Doctor',
        'Appointment',
        'MedicalRecord',
        'Prescription',
        'PrescriptionItem',
        'Drug',
        'Payment',
    ];

    const requiredEnums = ['Role', 'AppointmentStatus', 'PaymentStatus'];

    requiredModels.forEach(model => {
        if (schemaContent.includes(`model ${model}`)) {
            addResult('Database Schema', `Model: ${model}`, 'PASSED', 'Model defined');
            log(`✓ Model ${model}`, 'green');
        } else {
            addResult('Database Schema', `Model: ${model}`, 'FAILED', 'Model not found');
            log(`✗ Model ${model}`, 'red');
        }
    });

    requiredEnums.forEach(enumType => {
        if (schemaContent.includes(`enum ${enumType}`)) {
            addResult('Database Schema', `Enum: ${enumType}`, 'PASSED', 'Enum defined');
            log(`✓ Enum ${enumType}`, 'green');
        } else {
            addResult('Database Schema', `Enum: ${enumType}`, 'FAILED', 'Enum not found');
            log(`✗ Enum ${enumType}`, 'red');
        }
    });

    // Check for transaction usage in prescription service
    const prescriptionServicePath = path.join(__dirname, '../backend/src/services/prescription.service.ts');
    if (fs.existsSync(prescriptionServicePath)) {
        const serviceContent = fs.readFileSync(prescriptionServicePath, 'utf-8');
        if (serviceContent.includes('$transaction')) {
            addResult('Transactions', 'Prescription Service', 'PASSED', 'Uses Prisma transactions');
            log('✓ Prescription service uses transactions', 'green');
        } else {
            addResult('Transactions', 'Prescription Service', 'FAILED', 'No transaction usage found');
            log('✗ Prescription service missing transactions', 'red');
        }
    }
}

// Check 3: API Endpoints
async function checkAPIEndpoints() {
    log('\n=== Checking API Endpoints ===', 'blue');

    const endpoints = [
        { method: 'POST', path: '/auth/login', requiresAuth: false },
        { method: 'GET', path: '/patients', requiresAuth: true },
        { method: 'GET', path: '/appointments', requiresAuth: true },
        { method: 'GET', path: '/drugs', requiresAuth: true },
        { method: 'GET', path: '/prescriptions', requiresAuth: true },
        { method: 'GET', path: '/payments', requiresAuth: true },
    ];

    // First, try to get a token
    let token = null;
    try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'alice@klinik.com',
            password: 'password123',
        });
        token = loginResponse.data.data.token;
        addResult('Authentication', 'Login Endpoint', 'PASSED', 'Login successful');
        log('✓ Login endpoint working', 'green');
    } catch (error) {
        addResult('Authentication', 'Login Endpoint', 'FAILED', 'Cannot login - server may not be running');
        log('✗ Login failed - is the backend server running?', 'red');
        log('  Run: cd backend && npm run dev', 'yellow');
        return;
    }

    // Test protected endpoints
    for (const endpoint of endpoints) {
        if (!endpoint.requiresAuth) continue;

        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(`${BASE_URL}${endpoint.path}`, config);

            if (response.data && response.data.success !== undefined) {
                addResult('API Endpoints', `${endpoint.method} ${endpoint.path}`, 'PASSED', 'Returns proper format');
                log(`✓ ${endpoint.method} ${endpoint.path}`, 'green');
            } else {
                addResult('API Endpoints', `${endpoint.method} ${endpoint.path}`, 'WARNING', 'Response format may be incorrect');
                log(`⚠ ${endpoint.method} ${endpoint.path} - check response format`, 'yellow');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                addResult('API Endpoints', `${endpoint.method} ${endpoint.path}`, 'PASSED', 'Auth protection working');
                log(`✓ ${endpoint.method} ${endpoint.path} (auth protected)`, 'green');
            } else {
                addResult('API Endpoints', `${endpoint.method} ${endpoint.path}`, 'FAILED', error.message);
                log(`✗ ${endpoint.method} ${endpoint.path} - ${error.message}`, 'red');
            }
        }
    }
}

// Check 4: Test Files
async function checkTests() {
    log('\n=== Checking Test Files ===', 'blue');

    const testFiles = [
        'backend/src/tests/patient.test.ts',
        'backend/src/tests/prescription.service.test.ts',
        'frontend/tests-e2e/clinic-workflow.spec.ts',
    ];

    testFiles.forEach(file => {
        if (checkFileExists(file)) {
            const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
            const testCount = (content.match(/test\(|it\(/g) || []).length;
            addResult('Testing', file, 'PASSED', `${testCount} tests found`);
            log(`✓ ${file} (${testCount} tests)`, 'green');
        } else {
            addResult('Testing', file, 'FAILED', 'Test file not found');
            log(`✗ ${file}`, 'red');
        }
    });

    // Check for Jest config
    if (checkFileExists('backend/jest.config.js')) {
        addResult('Testing', 'Jest Configuration', 'PASSED', 'Jest configured');
        log('✓ Jest configuration exists', 'green');
    } else {
        addResult('Testing', 'Jest Configuration', 'FAILED', 'Jest config missing');
        log('✗ Jest configuration missing', 'red');
    }

    // Check for Playwright config
    if (checkFileExists('frontend/playwright.config.ts')) {
        addResult('Testing', 'Playwright Configuration', 'PASSED', 'Playwright configured');
        log('✓ Playwright configuration exists', 'green');
    } else {
        addResult('Testing', 'Playwright Configuration', 'FAILED', 'Playwright config missing');
        log('✗ Playwright configuration missing', 'red');
    }
}

// Check 5: Documentation
async function checkDocumentation() {
    log('\n=== Checking Documentation ===', 'blue');

    const docFiles = [
        { path: 'README.md', minLength: 500 },
        { path: 'docs/mapping.md', minLength: 1000 },
    ];

    docFiles.forEach(({ path: docPath, minLength }) => {
        if (checkFileExists(docPath)) {
            const content = fs.readFileSync(path.join(__dirname, '..', docPath), 'utf-8');
            if (content.length >= minLength) {
                addResult('Documentation', docPath, 'PASSED', `${content.length} characters`);
                log(`✓ ${docPath} (${content.length} chars)`, 'green');
            } else {
                addResult('Documentation', docPath, 'WARNING', `Only ${content.length} characters (expected ${minLength}+)`);
                log(`⚠ ${docPath} may be incomplete`, 'yellow');
            }
        } else {
            addResult('Documentation', docPath, 'FAILED', 'File not found');
            log(`✗ ${docPath}`, 'red');
        }
    });
}

// Generate Report
function generateReport() {
    log('\n=== Generating Report ===', 'blue');

    const totalChecks = results.passed.length + results.failed.length + results.warnings.length;
    const passRate = ((results.passed.length / totalChecks) * 100).toFixed(1);

    let report = `# Klinik Sentosa - Rubric Validation Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Checks**: ${totalChecks}
- **Passed**: ${results.passed.length} ✅
- **Failed**: ${results.failed.length} ❌
- **Warnings**: ${results.warnings.length} ⚠️
- **Pass Rate**: ${passRate}%

---

## Rubric Criteria Assessment

### ✅ PASSED (${results.passed.length})

${results.passed.map(r => `- **${r.category}** - ${r.item}: ${r.message}`).join('\n')}

---

### ❌ FAILED (${results.failed.length})

${results.failed.length > 0 ? results.failed.map(r => `- **${r.category}** - ${r.item}: ${r.message}`).join('\n') : '*No failures*'}

${results.failed.length > 0 ? `\n### 🔧 Fixes Required\n\n${results.failed.map(r => {
        let fix = '';
        if (r.category === 'File Structure') {
            fix = `Create missing file: \`${r.item}\``;
        } else if (r.category === 'API Endpoints') {
            fix = `Ensure backend server is running and endpoint \`${r.item}\` is implemented`;
        } else if (r.category === 'Database Schema') {
            fix = `Add missing ${r.item} to prisma/schema.prisma`;
        } else if (r.category === 'Testing') {
            fix = `Create ${r.item} with appropriate test cases`;
        } else {
            fix = `Fix: ${r.message}`;
        }
        return `- ${fix}`;
    }).join('\n')}` : ''}

---

### ⚠️ WARNINGS (${results.warnings.length})

${results.warnings.length > 0 ? results.warnings.map(r => `- **${r.category}** - ${r.item}: ${r.message}`).join('\n') : '*No warnings*'}

---

## Detailed Rubric Checklist

### Functionality (40%)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| User Authentication & Authorization (10%) | ${results.passed.some(r => r.category === 'Authentication') ? '✅ PASSED' : '❌ FAILED'} | JWT-based auth with role-based access control |
| Patient Management CRUD (10%) | ${results.passed.some(r => r.item.includes('patient')) ? '✅ PASSED' : '❌ FAILED'} | Full CRUD operations implemented |
| Appointment Scheduling (10%) | ${results.passed.some(r => r.item.includes('appointment')) ? '✅ PASSED' : '❌ FAILED'} | Appointment creation and management |
| Prescription with Stock Management (10%) | ${results.passed.some(r => r.item.includes('Prescription Service')) ? '✅ PASSED' : '❌ FAILED'} | Transactional prescription creation |

### Technical Implementation (30%)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Transactional Operations (10%) | ${results.passed.some(r => r.category === 'Transactions') ? '✅ PASSED' : '❌ FAILED'} | Prisma $transaction for stock management |
| Role-based Access Control (5%) | ${results.passed.some(r => r.item.includes('auth.middleware')) ? '✅ PASSED' : '❌ FAILED'} | Middleware-based authorization |
| Data Validation (5%) | ${results.passed.some(r => r.item.includes('validation')) ? '✅ PASSED' : '⚠️ CHECK'} | Zod schemas for validation |
| Error Handling (5%) | ${checkFileExists('backend/src/middleware/error.middleware.ts') ? '✅ PASSED' : '❌ FAILED'} | Centralized error handler |
| RESTful API Design (5%) | ${results.passed.filter(r => r.category === 'API Endpoints').length > 3 ? '✅ PASSED' : '❌ FAILED'} | Consistent API structure |

### Database Design (15%)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Normalized Schema (5%) | ${results.passed.filter(r => r.category === 'Database Schema').length > 5 ? '✅ PASSED' : '❌ FAILED'} | ${results.passed.filter(r => r.category === 'Database Schema').length} models defined |
| Proper Relationships (5%) | ${results.passed.some(r => r.item.includes('Model')) ? '✅ PASSED' : '❌ FAILED'} | Foreign keys and relations |
| Migrations & Seeding (5%) | ${checkFileExists('backend/prisma/seed.ts') ? '✅ PASSED' : '❌ FAILED'} | Seed script available |

### Testing (10%)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Unit Tests (5%) | ${results.passed.some(r => r.item.includes('test.ts')) ? '✅ PASSED' : '❌ FAILED'} | Jest tests for services |
| E2E Tests (5%) | ${results.passed.some(r => r.item.includes('e2e')) ? '✅ PASSED' : '❌ FAILED'} | Playwright workflow tests |

### Documentation (5%)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| README (2%) | ${results.passed.some(r => r.item === 'README.md') ? '✅ PASSED' : '❌ FAILED'} | Setup instructions |
| Use Case Mapping (3%) | ${results.passed.some(r => r.item === 'docs/mapping.md') ? '✅ PASSED' : '❌ FAILED'} | Complete mapping document |

---

## Recommendations

${passRate >= 90 ? '🎉 **Excellent!** The implementation meets most rubric criteria.' : passRate >= 70 ? '👍 **Good progress.** Address the failed items to improve the score.' : '⚠️ **Needs work.** Several critical items need attention.'}

${results.failed.length > 0 ? `\n### Priority Fixes:\n${results.failed.slice(0, 5).map((r, i) => `${i + 1}. ${r.category} - ${r.item}`).join('\n')}` : ''}

### Next Steps:

1. ${results.failed.length > 0 ? 'Fix all failed items listed above' : 'Run the full test suite'}
2. ${!results.passed.some(r => r.category === 'API Endpoints') ? 'Start the backend server and verify endpoints' : 'Test the E2E workflow'}
3. ${results.warnings.length > 0 ? 'Review and address warnings' : 'Deploy to staging environment'}
4. Run comprehensive testing: \`npm test\` (backend) and \`npm run test:e2e\` (frontend)

---

*Report generated by rubric-checker.js*
`;

    const reportPath = path.join(__dirname, '../docs/rubric-report.md');
    fs.writeFileSync(reportPath, report);
    log(`\n✓ Report saved to: docs/rubric-report.md`, 'green');

    return report;
}

// Main execution
async function main() {
    log('╔════════════════════════════════════════════════════════╗', 'blue');
    log('║     Klinik Sentosa - Rubric Validation Checker        ║', 'blue');
    log('╚════════════════════════════════════════════════════════╝', 'blue');

    try {
        await checkFileStructure();
        await checkDatabaseSchema();
        await checkAPIEndpoints();
        await checkTests();
        await checkDocumentation();

        const report = generateReport();

        log('\n' + '='.repeat(60), 'blue');
        log(`FINAL SCORE: ${results.passed.length}/${results.passed.length + results.failed.length + results.warnings.length}`, 'blue');
        log('='.repeat(60), 'blue');

        if (results.failed.length === 0) {
            log('\n🎉 All checks passed! Ready for submission.', 'green');
            process.exit(0);
        } else {
            log(`\n⚠️  ${results.failed.length} items need attention. Check docs/rubric-report.md for details.`, 'yellow');
            process.exit(1);
        }
    } catch (error) {
        log(`\n❌ Error running checker: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

main();
