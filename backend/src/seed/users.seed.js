const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedUsers = async () => {
  const adminEmail = 'admin@gari-lagbe.com';

  // Duplicate prevention: skip if admin already exists
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log('Admin user already exists — skipping.');
    return;
  }

  // Hash the password using bcryptjs (salt rounds: 12)
  const hashedPassword = await bcrypt.hash('Admin@12345', 12);

  await User.create({
    name: 'রাহেলা বেগম',
    email: adminEmail,
    phone: '01711-234567',
    password: hashedPassword,
    role: 'admin',
    profileImage: null,
    isActive: true,
    lastLogin: null,
  });

  console.log('Admin user seeded successfully.');
};

module.exports = seedUsers;


