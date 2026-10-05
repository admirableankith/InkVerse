const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Load environment variables from project root .env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const { initialUser } = require('../data/seedData');
const { Storage, setMongoStatus } = require('../data/storage');

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 10) {
    return 'Password must be at least 10 characters long.';
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return 'Password must contain both letters and numbers.';
  }
  return null;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Invalid email address format.';
  }
  return null;
}

async function run() {
  console.log('========================================================');
  console.log('🛡️  Discover with Ankur - Admin Account Setup Script');
  console.log('========================================================\n');

  const name = process.env.ADMIN_NAME ? process.env.ADMIN_NAME.trim() : 'Ankur';
  const email = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : '';
  const password = process.env.ADMIN_PASSWORD || '';

  // Validate inputs
  const emailError = validateEmail(email);
  if (emailError) {
    console.error(`❌ Validation Error: ${emailError}`);
    console.error('👉 Please set a valid ADMIN_EMAIL in your .env file.');
    process.exit(1);
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    console.error(`❌ Validation Error: ${passwordError}`);
    console.error('👉 Please set a strong ADMIN_PASSWORD (min 10 characters, letters + numbers) in your .env file.');
    process.exit(1);
  }

  // Connect to DB (Mongo if MONGO_URI is set, else local JSON fallback)
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      console.log('⏳ Connecting to MongoDB...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to MongoDB.');
      setMongoStatus(true);
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        console.error(`❌ Fatal Error connecting to MongoDB: ${err.message}`);
        process.exit(1);
      } else {
        console.log(`ℹ️  MongoDB not reachable (${err.message}). Using local JSON storage.`);
        setMongoStatus(false);
      }
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Fatal Error: MONGO_URI is required in production environment.');
      process.exit(1);
    }
    console.log('ℹ️  No MONGO_URI found. Initializing admin in local JSON storage (server/data/db.json)...');
    setMongoStatus(false);
  }

  // Check if admin already exists
  const existingUser = await Storage.getUser();
  if (existingUser && existingUser.email) {
    console.error(`\n⚠️  AN ADMIN ACCOUNT ALREADY EXISTS (${existingUser.email}).`);
    console.error('🔒 For security reasons, this setup script will refuse to overwrite an existing administrator.');
    console.error('👉 To change your password, use the "Forgot password" flow or log in and use "Change Password" in the dashboard.\n');
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }

  // Hash password
  console.log('🔒 Hashing password securely with bcrypt (cost factor: 12)...');
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create admin
  const newAdminData = {
    ...initialUser,
    name: name,
    email: email,
    password: hashedPassword,
    socialLinks: {
      ...initialUser.socialLinks,
      emailContact: email
    },
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const createdUser = await Storage.createUser(newAdminData);

  console.log('\n========================================================');
  console.log('🎉 Administrator account successfully created!');
  console.log(`👤 Name:     ${createdUser.name}`);
  console.log(`📧 Email:    ${createdUser.email}`);
  console.log('🔑 Password: [SECURELY HASHED & STORED]');
  console.log('========================================================\n');
  console.log('👉 You can now start the server (`npm run dev` or `npm start`) and log in at /admin/login.\n');

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Unexpected error during admin creation:', err);
  process.exit(1);
});
