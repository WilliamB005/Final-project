// server/routes/messages.js
import express from 'express';
import { Message } from '../models/Message.js';
import { Room } from '../models/Room.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate, MessageInput } from '../middleware/validate.js';

const messagesRouter = express.Router({ mergeParams: true });

// All message routes require authentication
messagesRouter.use(requireAuth);

// Get message history for a room (only if user is a member)
messagesRouter.get('/', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Verify user belongs to the room
    const room = await Room.findOne({ _id: roomId, members: req.userId });
    if (!room) {
      return res.status(403).json({ error: 'Access denied or room not found' });
    }

    const messages = await Message.find({ room: roomId })
      .populate('sender', 'email')
      .sort({ createdAt: 1 }) // Oldest to newest chat order
      .limit(100);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new message to a room (with Zod validation)
messagesRouter.post('/', validate(MessageInput), async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text } = req.body;

    // Verify user belongs to the room
    const room = await Room.findOne({ _id: roomId, members: req.userId });
    if (!room) {
      return res.status(403).json({ error: 'Access denied to this room' });
    }

    const message = await Message.create({
      room: roomId,
      sender: req.userId,
      text
    });

    // Populate sender email so the front end can render who sent it immediately
    await message.populate('sender', 'email');

    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default messagesRouter;