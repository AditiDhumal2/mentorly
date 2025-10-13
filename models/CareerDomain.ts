import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerDomain extends Document {
  name: string;
  description: string;
  skills: string[];
  projects: string[];
  tools: string[];
  roles: string[];
  averageSalary: {
    india: string;
    abroad: string;
  };
  resources: Array<{ title: string; url: string }>;
  relatedDomains: string[];
  lastUpdated: Date;
}

const CareerDomainSchema = new Schema<ICareerDomain>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  skills: [String],
  projects: [String],
  tools: [String],
  roles: [String],
  averageSalary: {
    india: String,
    abroad: String
  },
  resources: [{
    title: String,
    url: String
  }],
  relatedDomains: [String],
  lastUpdated: { type: Date, default: Date.now }
});

// Remove the duplicate export - just export the model
export const CareerDomain = mongoose.models.CareerDomain || mongoose.model<ICareerDomain>('CareerDomain', CareerDomainSchema);