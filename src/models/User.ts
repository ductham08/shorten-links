import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    telegram: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        default: 'user'
    },
    plan: {
        type: {
            type: String,
            default: 'basic'
        },
        totalLinks: {
            type: Number,
            default: 70
        },
        usedLinks: {
            type: Number,
            default: 0
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

const User = mongoose.model('User', UserSchema);

export default User; 