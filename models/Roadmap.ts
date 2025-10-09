import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  steps: [{
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['skill', 'project', 'profile', 'career'],
      required: true,
    },
    resources: [{
      title: String,
      url: String,
      type: String,
    }],
    estimatedDuration: String,
    priority: Number,
  }],
}, {
  timestamps: true,
});

export const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', roadmapSchema);