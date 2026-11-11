// server/models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 2000 
  }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);