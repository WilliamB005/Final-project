// server/middleware/validate.js
import { z } from 'zod';

// Schema for room creation
export const RoomInput = z.object({
  name: z.string().trim().min(1).max(100),
  courseCode: z.string().trim().min(1).max(20),
});

// Schema for chat messages
export const MessageInput = z.object({
  text: z.string().trim().min(1).max(2000),
});

// Generic validation middleware factory
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const msg = result.error.issues[0].message;
    return res.status(400).json({ error: msg });
  }
  req.body = result.data; // Strips unknown keys and assigns sanitized data
  next();
};