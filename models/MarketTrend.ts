// models/MarketTrend.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITrendingSkill {
  _id?: Types.ObjectId;
  skill: string;
  demandScore: number;
}

export interface IHiringDomain {
  _id?: Types.ObjectId;
  domain: string;
  openings: number;
}

export interface ISalaryComparison {
  _id?: Types.ObjectId;
  role: string;
  india: number;
  abroad: number;
}

export interface IHotArticle {
  _id?: Types.ObjectId;
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

const TrendingSkillSchema = new Schema<ITrendingSkill>({
  skill: { type: String, required: true },
  demandScore: { type: Number, required: true }
}, { _id: true });

const HiringDomainSchema = new Schema<IHiringDomain>({
  domain: { type: String, required: true },
  openings: { type: Number, required: true }
}, { _id: true });

const SalaryComparisonSchema = new Schema<ISalaryComparison>({
  role: { type: String, required: true },
  india: { type: Number, required: true },
  abroad: { type: Number, required: true }
}, { _id: true });

const HotArticleSchema = new Schema<IHotArticle>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  summary: { type: String, default: '' }
}, { _id: true });

const MarketTrendSchema = new Schema<IMarketTrend>({
  month: { type: String, required: true },
  trendingSkills: [TrendingSkillSchema],
  hiringDomains: [HiringDomainSchema],
  salaryComparison: [SalaryComparisonSchema],
  hotArticles: [HotArticleSchema],
  apiSource: { type: String, default: 'Industry Reports & Platform Analytics' },
  internalAnalytics: {
    mostCompletedSkills: [{ type: String }],
    popularResources: [{ type: String }]
  }
}, {
  timestamps: true
});

export const MarketTrend = mongoose.models.MarketTrend || mongoose.model<IMarketTrend>('MarketTrend', MarketTrendSchema);