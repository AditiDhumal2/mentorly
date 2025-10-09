import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['course', 'internship', 'portal', 'newsletter'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  tags: [String],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  free: {
    type: Boolean,
    default: true,
  },
  certificate: Boolean,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);