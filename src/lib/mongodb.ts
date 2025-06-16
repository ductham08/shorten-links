import mongoose, { Mongoose } from 'mongoose';

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

if (!process.env.MONGODB_URL) {
  throw new Error('Please add your MONGODB_URL to .env.local');
}

const MONGODB_URL = process.env.MONGODB_URL;

// Đảm bảo biến cached luôn tồn tại
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  try {
    if (global.mongoose?.conn) {
      return global.mongoose.conn;
    }

    if (!global.mongoose?.promise) {
      const opts = {
        bufferCommands: false,
      };

      const promise = mongoose.connect(MONGODB_URL, opts);
      if (global.mongoose) {
        global.mongoose.promise = promise;
      }
    }

    const conn = await global.mongoose?.promise;
    if (global.mongoose && conn) {
      global.mongoose.conn = conn;
    }

    return global.mongoose?.conn;
  } catch (error) {
    if (global.mongoose) {
      global.mongoose.promise = null;
    }
    throw error;
  }
}

export default connectDB; 