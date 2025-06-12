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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Url || mongoose.model('Url', urlSchema, 'shortener-url'); 