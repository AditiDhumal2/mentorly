import { Schema, model, models, Document } from 'mongoose';

export interface ITrendingSkill {
  skill: string;
  demandScore: number;
}

export interface IHiringDomain {
  domain: string;
  openings: number;
}

export interface ISalaryComparison {
  role: string;
  india: number; // LPA
  abroad: number; // USD thousands
}

export interface IHotArticle {
  title: string;
  url: string;
  summary?: string;
}

export interface IMarketTrends extends Document {
  month: string;
  trendingSkills: ITrendingSkill[];
  hiringDomains: IHiringDomain[];
  salaryComparison: ISalaryComparison[];
  hotArticles: IHotArticle[];
  apiSource: string;
  internalAnalytics: {
    mostCompletedSkills: string[];
    popularResources: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const MarketTrendsSchema = new Schema({
  month: { type: String, required: true },
  trendingSkills: [{
    skill: String,
    demandScore: Number
  }],
  hiringDomains: [{
    domain: String,
    openings: Number
  }],
  salaryComparison: [{
    role: String,
    india: Number,
    abroad: Number
  }],
  hotArticles: [{
    title: String,
    url: String,
    summary: String
  }],
  apiSource: String,
  internalAnalytics: {
    mostCompletedSkills: [String],
    popularResources: [String]
  }
}, {
  timestamps: true
});

const MarketTrends = models.MarketTrends || model<IMarketTrends>('MarketTrends', MarketTrendsSchema);

export default MarketTrends;