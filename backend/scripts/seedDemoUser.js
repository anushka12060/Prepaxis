require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const DEMO_EMAIL = 'test1@example.com';
const DEMO_PASSWORD = 'password123';
const DEMO_NAME = 'Mohit';

const seedDemoUser = async () => {
  await connectDB();

  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    console.log('Demo user already exists, resetting password...');
    existing.password = DEMO_PASSWORD; // triggers re-hash via pre-save hook
    await existing.save();
  } else {
    await User.create({
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      role: 'user',
    });
    console.log('Demo user created.');
  }

  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
};

seedDemoUser().catch((err) => {
  console.error(err);
  process.exit(1);
});