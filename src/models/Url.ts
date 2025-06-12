import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  longUrl: {
    type: String,
    required: true,
  },
  title: { 
    type: String, 
    required: false 
  },
  description: { 
    type: String, 
    required: false 
  },
  thumbnail: { 
    type: String, 
    required: false 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Url || mongoose.model('Url', urlSchema, 'shortener-url'); 