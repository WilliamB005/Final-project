// server/routes/rooms.js
import express from 'express';
import crypto from 'node:crypto';
import { Room } from '../models/Room.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate, RoomInput } from '../middleware/validate.js';

const roomsRouter = express.Router();

// All room routes require authentication
roomsRouter.use(requireAuth);

// Create a new study room (with Zod validation)
roomsRouter.post('/', validate(RoomInput), async (req, res) => {
  try {
    const { name, courseCode } = req.body;

    // Generate a short random invite code
    const inviteCode = crypto.randomBytes(4).toString('hex');

    const room = await Room.create({
      name,
      courseCode,
      inviteCode,
      createdBy: req.userId,
      members: [req.userId] // Creator is automatically a member
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all rooms the user belongs to
roomsRouter.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.userId }).sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join a room using an invite code
roomsRouter.post('/join', async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const room = await Room.findOne({ inviteCode });

    if (!room) {
      return res.status(404).json({ error: 'Room not found with that invite code' });
    }

    // Add user to members if not already joined
    if (!room.members.includes(req.userId)) {
      room.members.push(req.userId);
      await room.save();
    }

    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default roomsRouter;