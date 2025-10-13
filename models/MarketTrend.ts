import mongoose, { Document, Schema } from 'mongoose';

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
  india: number;
  abroad: number;
}

export interface IHotArticle {
  title: string;
  url: string;
  summary?: string;
}

export interface IMarketTrend extends Document {
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

const MarketTrendSchema = new Schema<IMarketTrend>({
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

// Use a different variable name to avoid conflict
const MarketTrendModel = mongoose.models.MarketTrend || mongoose.model<IMarketTrend>('MarketTrend', MarketTrendSchema);

export { MarketTrendModel as MarketTrend };