export interface MarketTrendsData {
  id: string;
  month: string;
  updatedAt: string;
  apiSource: string;
  trendingSkills: TrendingSkill[];
  hiringDomains: HiringDomain[];
  salaryComparison: SalaryComparison[];
  hotArticles: HotArticle[];
}

export interface TrendingSkill {
  id: string;
  skill: string;
  demandScore: number;
}

export interface HiringDomain {
  id: string;
  domain: string;
  openings: number;
}

export interface SalaryComparison {
  id: string;
  role: string;
  india: number;
  abroad: number;
}

export interface HotArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
}

export interface ApiResponse<T = MarketTrendsData> {
  success: boolean;
  data?: T;
  error?: string;
}