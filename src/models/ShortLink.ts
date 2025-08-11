import mongoose, { Schema, Document } from 'mongoose';

export interface IShortLink extends Document {
    slug: string;
    url: string;
    title: string;
    description: string;
    image: string;
}

const ShortLinkSchema: Schema = new Schema({
    slug: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.ShortLink || mongoose.model<IShortLink>('ShortLink', ShortLinkSchema);