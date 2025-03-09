import 'module-alias/register';
import { config } from 'dotenv';

// Load environment variables
config();

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout (10 seconds)
jest.setTimeout(30000);