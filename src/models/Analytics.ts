import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    urlId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Url',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    countries: [{
        country: String,
        count: {
            type: Number,
            default: 1
        }
    }],
    devices: [{
        userAgent: String,
        count: {
            type: Number,
            default: 1
        }
    }],
    referrers: [{
        domain: String,
        count: {
            type: Number,
            default: 1
        }
    }]
});

// Tạo compound index cho urlId và date để tối ưu query
analyticsSchema.index({ urlId: 1, date: 1 });

export default mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema, 'shortener-analytics'); 