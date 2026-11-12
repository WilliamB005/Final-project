// server/middleware/validate.js
import mongoose from 'mongoose';
import { z } from 'zod';

// Auth
export const RegisterInput = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(30, 'Username must be at most 30 characters'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const LoginInput = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// Rooms (fields match server/models/Room.js)
export const RoomInput = z.object({
  name: z.string().trim().min(1, 'Room name is required').max(100, 'Room name must be at most 100 characters'),
  description: z.string().trim().max(500, 'Description must be at most 500 characters').optional(),
});

// For updates every field is optional, but at least one must be sent
export const RoomUpdate = RoomInput.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Send at least one field to update (name or description)' },
);

// Messages (fields match server/models/Message.js)
export const MessageInput = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message must be at most 2000 characters'),
});

// Generic body validation middleware factory
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const msg = result.error.issues[0].message;
    return res.status(400).json({ error: msg });
  }
  req.body = result.data; // Strips unknown keys and assigns sanitized data
  next();
};

// Rejects malformed MongoDB ids (e.g. /rooms/abc) with 400 instead of a 500 CastError
export const validId = (...params) => (req, res, next) => {
  for (const name of params) {
    if (!mongoose.isValidObjectId(req.params[name])) {
      return res.status(400).json({ error: `Invalid ${name}` });
    }
  }
  next();
};
