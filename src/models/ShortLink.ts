import mongoose, { Schema, Document } from 'mongoose';

export interface IShortLink extends Document {
    userId: mongoose.Types.ObjectId;
    slug: string;
    url: string;
    clicks: number;
}

const ShortLinkSchema: Schema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    slug: { 
        type: String, 
        required: true, 
        unique: false 
    },
    url: { 
        type: String, 
        required: true 
    },
    clicks: { 
        type: Number, 
        required: true, 
        default: 0 
    },
}, { timestamps: true });

// Ensure schema updates are applied in dev/hot-reload by deleting existing model
if (mongoose.models.ShortLink) {
    mongoose.deleteModel('ShortLink');
}

export default mongoose.model<IShortLink>('ShortLink', ShortLinkSchema);