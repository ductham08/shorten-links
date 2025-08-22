import mongoose, { Schema, Document } from 'mongoose';

export interface IShortLink extends Document {
    userId: mongoose.Types.ObjectId;
    slug: string;
    url: string;
    clicks: number;
    icon: string;
    siteName: string;
    title: string;
    description: string;
    image: string;
    isIframe: boolean;
}

const ShortLinkSchema: Schema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    slug: { 
        type: String, 
        required: false, 
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
    icon: {
        type: String,
        required: false
    },
    siteName: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    isIframe: {
        type: Boolean,
        required: false,
        default: false
    }
}, { timestamps: true });

// Ensure schema updates are applied in dev/hot-reload by deleting existing model
if (mongoose.models.ShortLink) {
    mongoose.deleteModel('ShortLink');
}

export default mongoose.model<IShortLink>('ShortLink', ShortLinkSchema);