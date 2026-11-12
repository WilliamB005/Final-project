import express from 'express';
import Room from '../models/Room.js';
import Message from '../models/Message.js';
import requireAuth from '../middleware/requireAuth.js';
import { validate, validId, RoomInput, RoomUpdate } from '../middleware/validate.js';

const router = express.Router();

// Every room route needs a logged-in user
router.use(requireAuth);

// Get all study rooms (rooms are shared, so any logged-in user can see them)
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'username').sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get only the rooms the current user created
router.get('/mine', async (req, res) => {
  try {
    const rooms = await Room.find({ createdBy: req.userId }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new study room
router.post('/', validate(RoomInput), async (req, res) => {
  try {
    const { name, description } = req.body;
    const room = await Room.create({ name, description, createdBy: req.userId });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific room by ID
router.get('/:id', validId('id'), async (req, res) => {
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

// Loads the room and checks the current user created it.
// 404 if it doesn't exist, 403 if it belongs to someone else.
async function findOwnRoom(req, res) {
  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return null;
  }
  if (!room.createdBy.equals(req.userId)) {
    res.status(403).json({ error: 'Only the room creator can do that' });
    return null;
  }
  return room;
}

// Update a room (creator only)
router.put('/:id', validId('id'), validate(RoomUpdate), async (req, res) => {
  try {
    const room = await findOwnRoom(req, res);
    if (!room) return;

    room.set(req.body);
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a room and its messages (creator only)
router.delete('/:id', validId('id'), async (req, res) => {
  try {
    const room = await findOwnRoom(req, res);
    if (!room) return;

    await Message.deleteMany({ room: room._id });
    await room.deleteOne();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
