import express from 'express';
import Message from '../models/Message.js';
import Room from '../models/Room.js';
import requireAuth from '../middleware/requireAuth.js';
import { validate, validId, MessageInput } from '../middleware/validate.js';

// mergeParams gives access to :roomId from /api/rooms/:roomId/messages
const router = express.Router({ mergeParams: true });

router.use(requireAuth, validId('roomId'));

// 404 if the room in the URL doesn't exist
router.use(async (req, res, next) => {
  try {
    const exists = await Room.exists({ _id: req.params.roomId });
    if (!exists) {
      return res.status(404).json({ error: 'Room not found' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages for a room
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new message to a room
router.post('/', validate(MessageInput), async (req, res) => {
  try {
    const message = await Message.create({
      content: req.body.content,
      sender: req.userId,
      room: req.params.roomId,
    });
    await message.populate('sender', 'username');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a message (sender only)
router.delete('/:messageId', validId('messageId'), async (req, res) => {
  try {
    const message = await Message.findOne({ _id: req.params.messageId, room: req.params.roomId });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    if (!message.sender.equals(req.userId)) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }
    await message.deleteOne();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
