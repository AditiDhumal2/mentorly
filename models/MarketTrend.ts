import mongoose from 'mongoose';

const marketTrendSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },
  trendingSkills: [String],
  hiringDomains: [String],
  averageSalaries: {
    india: mongoose.Schema.Types.Mixed,
    abroad: mongoose.Schema.Types.Mixed,
  },
  highlights: [{
    title: String,
    url: String,
    summary: String,
  }],
  apiSource: String,
}, {
  timestamps: true,
});

export const MarketTrend = mongoose.models.MarketTrend || mongoose.model('MarketTrend', marketTrendSchema);