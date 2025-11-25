// Setup file for Jest tests
// This runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/klinik_sentosa_test?schema=public';
process.env.JWT_SECRET = 'test-secret-key';

// Increase timeout for database operations
jest.setTimeout(30000);
