import express from 'express';
import Message from '../models/Message.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router({ mergeParams: true });

// Get all messages for a room
router.get('/', requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new message to a room
router.post('/', requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;

    const message = new Message({
      content,
      sender: req.user._id,
      room: roomId,
    });

    await message.save();
    await message.populate('sender', 'username');

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
