const mongoose = require('mongoose');
const dns = require('dns');
const { setMongoStatus } = require('../data/storage');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!uri || !uri.trim()) {
    if (isProduction) {
      console.error('\n❌ FATAL PRODUCTION ERROR: MONGO_URI is required in production environment.');
      console.error('🔒 The server refuses to start with file fallback in production to guarantee data persistence.');
      console.error('👉 Please configure MONGO_URI in your production environment variables (e.g. MongoDB Atlas).\n');
      process.exit(1);
    }
    console.log('ℹ️  [STORAGE MODE: LOCAL JSON FILE]');
    console.log('ℹ️  No MONGO_URI configured in environment. Using server/data/db.json persistent storage.\n');
    setMongoStatus(false);
    return;
  }

  // Configure public DNS resolvers if using mongodb+srv to ensure seamless SRV lookup across all OS/ISP networks
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    } catch (e) {
      // Ignore if not permitted
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('\n========================================================');
    console.log('✅ [STORAGE MODE: MONGODB ATLAS / CLOUD DATABASE]');
    console.log(`📡 Connected to Host: ${conn.connection.host}`);
    console.log(`🗄️  Database Name:     ${conn.connection.name}`);
    console.log('========================================================\n');
    setMongoStatus(true);
  } catch (error) {
    if (isProduction) {
      console.error(`\n❌ FATAL PRODUCTION ERROR: Could not connect to MongoDB: ${error.message}`);
      console.error('🔒 Exiting process to prevent data loss in production.\n');
      process.exit(1);
    }
    console.log(`\n⚠️  MongoDB connection failed (${error.message}).`);
    console.log('ℹ️  [DEV FALLBACK] Falling back to local persistent JSON database (server/data/db.json).\n');
    setMongoStatus(false);
  }
};

module.exports = connectDB;
