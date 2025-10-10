import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  type: String,
});

const stepSchema = new mongoose.Schema({
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
  resources: [resourceSchema],
  estimatedDuration: String,
  priority: Number,
});

const roadmapSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true,
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
  steps: [stepSchema],
}, {
  timestamps: true,
});

export const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', roadmapSchema);