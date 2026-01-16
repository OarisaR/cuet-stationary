// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Set test environment variables
process.env.NODE_ENV = 'test';