import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytic extends Document {
  linkId: mongoose.Types.ObjectId;
  countries: Map<string, number>;
  totalClicks: number;
}

const AnalyticSchema: Schema<IAnalytic> = new Schema(
  {
    linkId: { type: Schema.Types.ObjectId, ref: 'ShortLink', required: true, unique: true, index: true },
    countries: { type: Map, of: Number, default: {} },
    totalClicks: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Ensure hot-reload safe model compilation
if (mongoose.models.Analytic) {
  mongoose.deleteModel('Analytic');
}

export default mongoose.model<IAnalytic>('Analytic', AnalyticSchema);


