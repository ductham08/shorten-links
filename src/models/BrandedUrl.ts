import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandedUrl extends Document {
    userId: mongoose.Types.ObjectId;
    slug: string;
    longUrl: string;
    title: string;
    description: string;
    image: string;
    clicks: number;
}

const BrandedUrlSchema: Schema = new Schema({
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
    longUrl: { 
        type: String, 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        required: true 
    },
    clicks: { 
        type: Number, 
        required: true, 
        default: 0 
    },
}, { timestamps: true });

if (mongoose.models.BrandedUrl) {
    mongoose.deleteModel('BrandedUrl');
}

export default mongoose.model<IBrandedUrl>('BrandedUrl', BrandedUrlSchema);