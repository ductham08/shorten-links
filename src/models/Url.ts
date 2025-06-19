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
  clicks: {
    type: Number,
    default: 0,
  },
  visits: [{
    country: String,
    count: { type: Number, default: 1 },
    lastVisit: { type: Date, default: Date.now }
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Url || mongoose.model('Url', urlSchema, 'shortener-url'); 