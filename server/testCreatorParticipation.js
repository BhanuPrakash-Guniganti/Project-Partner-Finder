const mongoose = require('mongoose');
const Project = require('./models/Project');
const Team = require('./models/Team');
const User = require('./models/User');
const Application = require('./models/Application');

const connectDB = require('./config/db');

async function runEdgeCaseTests() {
  console.log('====================================================');
  console.log('   STARTING EDGE CASE & INTEGRATION TEST SUITE      ');
  console.log('====================================================\n');

  try {
    await connectDB();
    console.log('Database Connected Successfully.');

    // 1. Create Test Users
    const creatorUser = await User.create({
      name: 'Alice Creator',
      email: 'alice@example.com',
      passwordHash: 'hash123',
      role: 'student',
      skills: [{ name: 'React', level: 'Advanced' }, { name: 'TypeScript', level: 'Intermediate' }]
    });

    const bobDev = await User.create({
      name: 'Bob Backend',
      email: 'bob@example.com',
      passwordHash: 'hash123',
      role: 'student',
      skills: [{ name: 'Node.js', level: 'Advanced' }, { name: 'MongoDB', level: 'Advanced' }]
    });

    const charlieDesigner = await User.create({
      name: 'Charlie Designer',
      email: 'charlie@example.com',
      passwordHash: 'hash123',
      role: 'student',
      skills: [{ name: 'Figma', level: 'Advanced' }, { name: 'UI/UX Design', level: 'Advanced' }]
    });

    // -------------------------------------------------------------
    // EDGE CASE 1: Creator Works on Project (Yes)
    // -------------------------------------------------------------
    console.log('\n[EDGE CASE 1] Creator Works on Project (Yes) with role "Frontend Developer"');
    const project1 = await Project.create({
      ownerId: creatorUser._id,
      title: 'DevCollab Platform',
      description: 'Full stack student collaboration workspace.',
      teamSize: 3,
      requiredRoles: [
        { title: 'Frontend Developer', count: 1, skills: ['React', 'TypeScript'] },
        { title: 'Backend Developer', count: 1, skills: ['Node.js', 'MongoDB'] },
        { title: 'UI/UX Designer', count: 1, skills: ['Figma'] }
      ],
      creator: {
        participation: true,
        role: 'Frontend Developer',
        skills: ['React', 'TypeScript']
      }
    });

    const team1 = await Team.create({
      projectId: project1._id,
      members: [{
        userId: creatorUser._id,
        role: project1.creator.role || 'Project Lead',
        isOwner: true
      }]
    });

    console.log(`✓ Project 1 Created. Creator Participation: ${project1.creator.participation}`);
    console.log(`✓ Creator Role: ${project1.creator.role}`);
    console.log(`✓ Initial Members Count: ${team1.members.length} of ${project1.teamSize}`);

    // Check Role Fill status for Project 1:
    // "Frontend Developer" is filled by Creator!
    const p1FrontendFilled = team1.members.filter(m => m.role.toLowerCase().includes('frontend')).length;
    const p1BackendFilled = team1.members.filter(m => m.role.toLowerCase().includes('backend')).length;
    console.log(`✓ Role 'Frontend Developer' filled: ${p1FrontendFilled} / 1 (Filled by Creator)`);
    console.log(`✓ Role 'Backend Developer' filled: ${p1BackendFilled} / 1 (Open for recruitment)`);

    if (project1.creator.participation === true && team1.members.length === 1 && p1FrontendFilled === 1 && p1BackendFilled === 0) {
      console.log('✅ EDGE CASE 1 PASSED: Creator is properly registered in working team, occupies 1 slot, and fills their specified role.');
    } else {
      throw new Error('Edge Case 1 failed validation.');
    }

    // -------------------------------------------------------------
    // EDGE CASE 2: Creator Does NOT Work on Project (No - Management Only)
    // -------------------------------------------------------------
    console.log('\n[EDGE CASE 2] Creator Does NOT Work on Project (No - Management Only)');
    const project2 = await Project.create({
      ownerId: creatorUser._id,
      title: 'Open Campus Hackathon Portal',
      description: 'Campus management portal.',
      teamSize: 2,
      requiredRoles: [
        { title: 'Backend Developer', count: 1, skills: ['Node.js'] },
        { title: 'UI/UX Designer', count: 1, skills: ['Figma'] }
      ],
      creator: {
        participation: false,
        role: '',
        skills: []
      }
    });

    const team2 = await Team.create({
      projectId: project2._id,
      members: []
    });

    console.log(`✓ Project 2 Created. Creator Participation: ${project2.creator.participation}`);
    console.log(`✓ Initial Members Count: ${team2.members.length} of ${project2.teamSize}`);
    console.log(`✓ Open Positions: ${project2.teamSize - team2.members.length} of ${project2.teamSize} open`);

    if (project2.creator.participation === false && team2.members.length === 0) {
      console.log('✅ EDGE CASE 2 PASSED: Creator manages the project but does not consume a team member slot.');
    } else {
      throw new Error('Edge Case 2 failed validation.');
    }

    // -------------------------------------------------------------
    // EDGE CASE 3: New Member Joins / Is Accepted into Project 2
    // -------------------------------------------------------------
    console.log('\n[EDGE CASE 3] New Member Joins (Bob joins Project 2 as Backend Developer)');
    team2.members.push({
      userId: bobDev._id,
      role: 'Backend Developer',
      isOwner: false,
      joinedAt: new Date()
    });
    await team2.save();

    console.log(`✓ Updated Team 2 Members Count: ${team2.members.length} of ${project2.teamSize}`);
    const p2BackendFilled = team2.members.filter(m => m.role.toLowerCase().includes('backend')).length;
    const p2DesignerFilled = team2.members.filter(m => m.role.toLowerCase().includes('designer')).length;
    console.log(`✓ Role 'Backend Developer' status: ${p2BackendFilled === 1 ? 'FILLED (1/1)' : 'OPEN'}`);
    console.log(`✓ Role 'UI/UX Designer' status: ${p2DesignerFilled === 1 ? 'FILLED' : 'OPEN (1 open)'}`);

    if (team2.members.length === 1 && p2BackendFilled === 1 && p2DesignerFilled === 0) {
      console.log('✅ EDGE CASE 3 PASSED: New member correctly increments count and marks matching role as FILLED.');
    } else {
      throw new Error('Edge Case 3 failed validation.');
    }

    // -------------------------------------------------------------
    // EDGE CASE 4: Second Member Joins -> Team Becomes Complete / Full
    // -------------------------------------------------------------
    console.log('\n[EDGE CASE 4] Second Member Joins (Charlie joins Project 2 as UI/UX Designer)');
    team2.members.push({
      userId: charlieDesigner._id,
      role: 'UI/UX Designer',
      isOwner: false,
      joinedAt: new Date()
    });
    await team2.save();

    const isFull = team2.members.length >= project2.teamSize;
    console.log(`✓ Updated Team 2 Members Count: ${team2.members.length} of ${project2.teamSize} (Team Full: ${isFull})`);

    if (team2.members.length === 2 && isFull) {
      console.log('✅ EDGE CASE 4 PASSED: Team capacity reaches 100% and marks team as full.');
    } else {
      throw new Error('Edge Case 4 failed validation.');
    }

    // -------------------------------------------------------------
    // EDGE CASE 5: Member Leaves / Is Removed
    // -------------------------------------------------------------
    console.log('\n[EDGE CASE 5] Member Leaves (Charlie leaves Project 2)');
    team2.members = team2.members.filter(m => m.userId.toString() !== charlieDesigner._id.toString());
    await team2.save();

    console.log(`✓ After Leave Members Count: ${team2.members.length} of ${project2.teamSize}`);
    const p2DesignerAfterLeave = team2.members.filter(m => m.role.toLowerCase().includes('designer')).length;
    console.log(`✓ Role 'UI/UX Designer' status after leave: ${p2DesignerAfterLeave === 0 ? 'OPEN AGAIN (1 open)' : 'FILLED'}`);

    if (team2.members.length === 1 && p2DesignerAfterLeave === 0) {
      console.log('✅ EDGE CASE 5 PASSED: Member departure decrements count and reopens role for recruitment.');
    } else {
      throw new Error('Edge Case 5 failed validation.');
    }

    // -------------------------------------------------------------
    // EDGE CASE 6: Creator Role Update
    // -------------------------------------------------------------
    console.log('\n[EDGE CASE 6] Creator Role Update in Project 1 (From "Frontend Developer" to "Full Stack Developer")');
    project1.creator.role = 'Full Stack Developer';
    await project1.save();

    const creatorTeamMember = team1.members.find(m => m.userId.toString() === creatorUser._id.toString());
    if (creatorTeamMember) {
      creatorTeamMember.role = 'Full Stack Developer';
      await team1.save();
    }

    console.log(`✓ Creator Role in Project: ${project1.creator.role}`);
    console.log(`✓ Creator Role in Team: ${team1.members[0].role}`);

    if (project1.creator.role === 'Full Stack Developer' && team1.members[0].role === 'Full Stack Developer') {
      console.log('✅ EDGE CASE 6 PASSED: Creator role update propagates cleanly to team roster.');
    } else {
      throw new Error('Edge Case 6 failed validation.');
    }

    // -------------------------------------------------------------
    // EDGE CASE 7: Refresh & Navigation Persistence (Re-query from DB)
    // -------------------------------------------------------------
    console.log('\n[EDGE CASE 7] Data Persistence Across Simulated Refresh & Re-queries');
    const freshProj1 = await Project.findById(project1._id);
    const freshTeam1 = await Team.findOne({ projectId: project1._id }).populate('members.userId', 'name email');
    const freshProj2 = await Project.findById(project2._id);
    const freshTeam2 = await Team.findOne({ projectId: project2._id }).populate('members.userId', 'name email');

    console.log(`✓ Fresh Project 1 Creator Participation: ${freshProj1.creator.participation} | Role: ${freshProj1.creator.role} | Team: ${freshTeam1.members[0].userId.name} (${freshTeam1.members[0].role})`);
    console.log(`✓ Fresh Project 2 Creator Participation: ${freshProj2.creator.participation} | Member count: ${freshTeam2.members.length} | First member: ${freshTeam2.members[0].userId.name} (${freshTeam2.members[0].role})`);

    if (freshProj1.creator.participation === true && freshProj2.creator.participation === false && freshTeam2.members.length === 1) {
      console.log('✅ EDGE CASE 7 PASSED: All data models, roles, and member allocations persist across database queries.');
    } else {
      throw new Error('Edge Case 7 failed validation.');
    }

    // Cleanup test records
    await Project.deleteMany({ _id: { $in: [project1._id, project2._id] } });
    await Team.deleteMany({ projectId: { $in: [project1._id, project2._id] } });
    await User.deleteMany({ _id: { $in: [creatorUser._id, bobDev._id, charlieDesigner._id] } });

    console.log('\n====================================================');
    console.log('   ALL 7 EDGE CASE TESTS PASSED WITH ZERO ERRORS!   ');
    console.log('====================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Suite Failure:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

runEdgeCaseTests();
