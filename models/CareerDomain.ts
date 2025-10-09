import mongoose from 'mongoose';

const careerDomainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  skills: [String],
  projects: [String],
  tools: [String],
  roles: [String],
  averageSalary: {
    india: String,
    abroad: String,
  },
  resources: [{
    title: String,
    url: String,
  }],
  relatedDomains: [String],
}, {
  timestamps: true,
});

export const CareerDomain = mongoose.models.CareerDomain || mongoose.model('CareerDomain', careerDomainSchema);