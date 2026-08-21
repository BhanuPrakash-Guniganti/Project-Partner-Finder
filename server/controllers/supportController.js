const SupportTicket = require('../models/SupportTicket');
const { sendSupportEmail, TARGET_EMAIL } = require('../services/emailService');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createSupportTicket = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: 'Subject is required.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    const userId = req.user ? req.user._id || req.user.id : null;

    // 1. Create support ticket in database
    const ticket = await SupportTicket.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      userId,
      status: 'Open'
    });

    // 2. Dispatch email to target support inbox (connectwithguniganti@gmail.com)
    const emailResult = await sendSupportEmail({
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      ticketId: ticket._id,
      userId
    });

    // 3. Update ticket delivery status
    ticket.emailSent = emailResult.success;
    if (!emailResult.success && emailResult.error) {
      ticket.emailError = emailResult.error;
    }
    await ticket.save();

    res.status(201).json({
      success: true,
      message: `Your message has been sent to our support team (${TARGET_EMAIL}). We will get back to you shortly.`,
      ticket: {
        id: ticket._id,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const getSupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSupportTicket,
  getSupportTickets
};
