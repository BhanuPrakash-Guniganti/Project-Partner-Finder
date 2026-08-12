const Message = require('../models/Message');
const { emitDirectMessage, emitGroupMessage } = require('../config/socket');

const getDirectMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, recipientId: userId },
        { senderId: userId, recipientId: req.user.id }
      ]
    })
    .populate('senderId', 'name avatar')
    .populate('recipientId', 'name avatar')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

const getProjectMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const messages = await Message.find({ projectId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, projectId, content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required.' });

    const message = await Message.create({
      senderId: req.user.id,
      recipientId: recipientId || null,
      projectId: projectId || null,
      content
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name avatar')
      .populate('recipientId', 'name avatar');

    // AFTER successful DB write, trigger real-time Socket.IO emission to recipient/group!
    try {
      if (recipientId) {
        emitDirectMessage(recipientId, populated);
      } else if (projectId) {
        emitGroupMessage(projectId, populated);
      }
    } catch (socketErr) {
      console.warn('[Socket Emission Notice]', socketErr.message);
    }

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDirectMessages,
  getProjectMessages,
  sendMessage
};
