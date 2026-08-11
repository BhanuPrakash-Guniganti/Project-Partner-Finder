const connectDB = require('./config/db');
const User = require('./models/User');
const matchingService = require('./services/matchingService');

const verifySkillProficiency = async () => {
  try {
    console.log('[Test Skill Proficiency] Connecting to DB...');
    await connectDB();

    let user = await User.findOne({ email: 'alex@student.edu' });
    if (!user) {
      user = await User.create({
        name: 'Alex Rivera',
        email: 'alex@student.edu',
        passwordHash: 'dummy',
        skills: []
      });
    }

    console.log('[Test Skill Proficiency] Updating skills with exact proficiency levels...');
    const testSkills = [
      { name: 'Python', proficiency: 'Advanced' },
      { name: 'React.js', proficiency: 'Expert' },
      { name: 'Docker', proficiency: 'Beginner' }
    ];

    user.skills = testSkills;
    await user.save();

    console.log('[Test Skill Proficiency] Saved skills to MongoDB:');
    const updatedUser = await User.findById(user._id);
    console.log(JSON.stringify(updatedUser.skills, null, 2));

    // Verify stored values match exact input
    const pythonSkill = updatedUser.skills.find(s => s.name === 'Python');
    const reactSkill = updatedUser.skills.find(s => s.name === 'React.js');
    const dockerSkill = updatedUser.skills.find(s => s.name === 'Docker');

    if (pythonSkill?.proficiency !== 'Advanced') throw new Error('Python proficiency mismatch');
    if (reactSkill?.proficiency !== 'Expert') throw new Error('React.js proficiency mismatch');
    if (dockerSkill?.proficiency !== 'Beginner') throw new Error('Docker proficiency mismatch');

    console.log('✅ ALL PROFICIENCY VERIFICATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
};

verifySkillProficiency();
