import mongoose from 'mongoose';

const brandingChecklistSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  tasks: [{
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['linkedin', 'github', 'leetcode', 'internship', 'resume'],
      required: true,
    },
    doneBy: String,
    optional: {
      type: Boolean,
      default: false,
    },
    tutorial: {
      title: String,
      platform: String,
      url: String,
    },
  }],
}, {
  timestamps: true,
});

export const BrandingChecklist = mongoose.models.BrandingChecklist || mongoose.model('BrandingChecklist', brandingChecklistSchema);