const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const testFlow = async () => {
  try {
    console.log('[Test Auth Flow] Connecting to DB...');
    await connectDB();

    const testEmail = `test_${Date.now()}@student.edu`;
    const testPassword = 'Password123!';
    const testName = 'Test User';

    console.log(`[Test Auth Flow] Registering test account (${testEmail})...`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);

    const newUser = await User.create({
      name: testName,
      email: testEmail.toLowerCase(),
      passwordHash,
      role: 'student',
      skills: [{ name: 'React', proficiency: 'Intermediate' }],
      interests: ['Web Development'],
      preferredRoles: ['Frontend Developer'],
      availability: '10-15 hrs/week'
    });

    console.log('[Test Auth Flow] Registration SUCCESS! User ID:', newUser._id);

    console.log('[Test Auth Flow] Attempting Login...');
    const foundUser = await User.findOne({ email: testEmail.toLowerCase() });
    if (!foundUser) throw new Error('User not found during login test');

    const isMatch = await bcrypt.compare(testPassword, foundUser.passwordHash);
    if (!isMatch) throw new Error('Password mismatch during login test');

    const token = jwt.sign(
      { id: foundUser._id, role: foundUser.role, email: foundUser.email },
      process.env.JWT_SECRET || 'super_secret_jwt_key_project_partner_finder_2026',
      { expiresIn: '30d' }
    );

    console.log('[Test Auth Flow] Login SUCCESS! JWT Token generated:', token.slice(0, 25) + '...');
    process.exit(0);
  } catch (err) {
    console.error('[Test Auth Flow Error]', err);
    process.exit(1);
  }
};

testFlow();
