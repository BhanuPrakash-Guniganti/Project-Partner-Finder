const Message = require('../models/Message');
const Team = require('../models/Team');
const { emitDirectMessage, emitGroupMessage } = require('../config/socket');

const getDirectMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
        { senderId: currentUserId, recipientId: userId },
        { senderId: userId, recipientId: currentUserId }
      ]
    })
    .populate('sender senderId', 'name avatar')
    .populate('receiver recipientId', 'name avatar')
    .populate('replyTo')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

const getProjectMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const currentUserId = req.user.id;

    // Authorization: Verify user is a member of the project team
    const team = await Team.findOne({ projectId, 'members.userId': currentUserId });
    if (!team && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You are not a member of this project team.' });
    }

    const messages = await Message.find({
      $or: [
        { project: projectId },
        { projectId: projectId }
      ]
    })
    .populate('sender senderId', 'name avatar')
    .populate('replyTo')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, receiver, projectId, project, content, message: msgText, attachments, replyTo } = req.body;
    const bodyContent = content || msgText;

    if (!bodyContent) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const targetRecipient = recipientId || receiver || null;
    const targetProject = projectId || project || null;
    const currentUserId = req.user.id;

    // If project chat, verify authorization
    if (targetProject) {
      const teamObj = await Team.findOne({ projectId: targetProject, 'members.userId': currentUserId });
      if (!teamObj && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden. Only project team members can broadcast messages.' });
      }
    }

    const messageDoc = await Message.create({
      sender: currentUserId,
      senderId: currentUserId,
      receiver: targetRecipient,
      recipientId: targetRecipient,
      project: targetProject,
      projectId: targetProject,
      content: bodyContent,
      message: bodyContent,
      attachments: attachments || [],
      replyTo: replyTo || null,
      readBy: [{ userId: currentUserId, readAt: new Date() }]
    });

    const populated = await Message.findById(messageDoc._id)
      .populate('sender senderId', 'name avatar')
      .populate('receiver recipientId', 'name avatar')
      .populate('replyTo');

    try {
      if (targetRecipient) {
        emitDirectMessage(targetRecipient, populated);
      } else if (targetProject) {
        emitGroupMessage(targetProject, populated);
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
