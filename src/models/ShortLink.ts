import mongoose, { Schema, Document } from 'mongoose';

export interface IShortLink extends Document {
    userId: mongoose.Types.ObjectId;
    slug: string;
    url: string;
    title: string;
    description: string;
    image: string;
}

const ShortLinkSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
}, { timestamps: true });

// Ensure schema updates are applied in dev/hot-reload by deleting existing model
if (mongoose.models.ShortLink) {
    mongoose.deleteModel('ShortLink');
}

export default mongoose.model<IShortLink>('ShortLink', ShortLinkSchema);