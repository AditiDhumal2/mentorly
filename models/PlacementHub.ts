import mongoose from 'mongoose';

const placementHubSchema = new mongoose.Schema({
  mustHaveSkills: [String],
  goodToHaveSkills: [String],
  toolsAndPractice: {
    mockInterviewPortal: String,
    resumeTemplates: [{
      title: String,
      url: String,
    }],
    topCodingProblems: [{
      title: String,
      platform: String,
      url: String,
    }],
    contestCalendar: [{
      name: String,
      date: Date,
      platform: String,
    }],
  },
  interviewTips: [{
    title: String,
    description: String,
  }],
}, {
  timestamps: true,
});

export const PlacementHub = mongoose.models.PlacementHub || mongoose.model('PlacementHub', placementHubSchema);