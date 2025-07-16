import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshToken: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);