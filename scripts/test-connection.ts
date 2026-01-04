import { config } from 'dotenv';
import { resolve } from 'path';
import { getDatabase } from '../lib/mongodb';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    const db = await getDatabase();
    
    // Ping the database
    const result = await db.admin().ping();
    
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Database:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name).join(', ') || 'None');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('\n💡 Make sure to:');
    console.log('   1. Create .env.local file');
    console.log('   2. Add MONGODB_URI with your connection string');
    console.log('   3. Replace <db_password> with actual password');
    console.log('   4. Whitelist your IP in MongoDB Atlas');
  } finally {
    process.exit(0);
  }
}

testConnection();
