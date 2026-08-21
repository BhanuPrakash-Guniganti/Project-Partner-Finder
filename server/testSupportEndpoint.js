const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const SupportTicket = require('./models/SupportTicket');
const { sendSupportEmail, TARGET_EMAIL } = require('./services/emailService');

const runSupportAuditTest = async () => {
  console.log('====================================================');
  console.log('    RUNNING CONTACT SUPPORT EMAIL & AUDIT SUITE     ');
  console.log('====================================================\n');

  let mongod = null;
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✓ Connected to test in-memory database\n');

    // TEST 1: Validate Target Recipient Email
    console.log('[TEST 1] Verifying Target Email Configuration');
    if (TARGET_EMAIL === 'connectwithguniganti@gmail.com') {
      console.log(`✓ Target Email is correctly set to: ${TARGET_EMAIL}`);
    } else {
      throw new Error(`Target email mismatch: expected connectwithguniganti@gmail.com, got ${TARGET_EMAIL}`);
    }

    // TEST 2: Email Service Dispatch
    console.log('\n[TEST 2] Testing Support Email Dispatch Execution');
    const emailResult = await sendSupportEmail({
      name: 'John Developer',
      email: 'john.dev@example.com',
      subject: 'Inquiry regarding Grok AI Partner Matching',
      message: 'Hello, I have a question regarding matching scores for Full Stack roles.',
      ticketId: 'TEST-1001'
    });

    if (emailResult.success && emailResult.recipient === 'connectwithguniganti@gmail.com') {
      console.log(`✓ Email dispatch handled successfully targeting ${emailResult.recipient}`);
    } else {
      throw new Error('Email dispatch failed');
    }

    // TEST 3: Database Persistence of Support Ticket
    console.log('\n[TEST 3] Testing Support Ticket Model Persistence');
    const ticket = await SupportTicket.create({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      subject: 'Team Workspace Collaboration Question',
      message: 'How do I invite members directly from candidate discovery?',
      status: 'Open',
      emailSent: true
    });

    const savedTicket = await SupportTicket.findById(ticket._id);
    if (savedTicket && savedTicket.email === 'sarah@example.com' && savedTicket.status === 'Open') {
      console.log(`✓ Support ticket #${savedTicket._id} persisted in MongoDB with correct fields.`);
    } else {
      throw new Error('Support ticket failed to save in database');
    }

    console.log('\n====================================================');
    console.log('  CONTACT SUPPORT & EMAIL AUDIT PASSED WITH 0 ERRORS! ');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Support Audit Test Failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  }
};

runSupportAuditTest();
