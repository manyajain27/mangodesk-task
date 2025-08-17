import mongoose, { Schema, Document } from 'mongoose';

export interface ISummary extends Document {
  originalTranscript: string;
  customPrompt: string;
  generatedSummary: string;
  editedSummary?: string;
  emailsSent?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SummarySchema: Schema = new Schema({
  originalTranscript: {
    type: String,
    required: true,
  },
  customPrompt: {
    type: String,
    required: true,
  },
  generatedSummary: {
    type: String,
    required: true,
  },
  editedSummary: {
    type: String,
    default: null,
  },
  emailsSent: [{
    type: String,
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Summary || mongoose.model<ISummary>('Summary', SummarySchema);