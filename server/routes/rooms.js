import express from 'express';
import Room from '../models/Room.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

// Get all study rooms
router.get('/', requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'username');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new study room
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const room = new Room({
      name,
      description,
      createdBy: req.user._id,
    });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific room by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('createdBy', 'username');
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;