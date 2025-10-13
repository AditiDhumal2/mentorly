import { getLatestMarketTrends } from '@/actions/marketTrends.actions';
import TrendCard from './components/TrendCard';
import HiringCard from './components/HiringCard';
import SalaryTable from './components/SalaryTable';
import HighlightCard from './components/HighlightCard';

// Remove the DemandIndicator import from here since it's only used in TrendCard

interface TrendingSkill {
  skill: string;
  demandScore: number;
}

interface HiringDomain {
  domain: string;
  openings: number;
}

interface SalaryData {
  role: string;
  india: number;
  abroad: number;
}

interface HotArticle {
  title: string;
  url: string;
  summary?: string;
}

export default async function MarketTrendsPage() {
  const trendsData = await getLatestMarketTrends();

  if (!trendsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Market Trends
          </h1>
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                No Data Available
              </h3>
              <p className="text-yellow-700">
                Market trends data is currently being updated. Please check back later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const trendingSkills = trendsData.trendingSkills as TrendingSkill[];
  const hiringDomains = trendsData.hiringDomains as HiringDomain[];
  const salaryComparison = trendsData.salaryComparison as SalaryData[];
  const hotArticles = trendsData.hotArticles as HotArticle[];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Market Trends
              </h1>
              <p className="text-gray-600 mt-2">
                Current industry insights and hiring landscape for {trendsData.month}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-sm text-gray-500">
              Last updated: {new Date(trendsData.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trending Skills & Hiring Domains */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending Skills Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Trending Skills
                </h2>
                <span className="text-sm text-gray-500">
                  Top {trendingSkills.length} skills by demand
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingSkills
                  .sort((a: TrendingSkill, b: TrendingSkill) => b.demandScore - a.demandScore)
                  .map((skill: TrendingSkill, index: number) => (
                    <TrendCard
                      key={skill.skill}
                      skill={skill.skill}
                      demandScore={skill.demandScore}
                      rank={index + 1}
                    />
                  ))}
              </div>
            </section>

            {/* Hiring Domains Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Top Hiring Domains
                </h2>
                <span className="text-sm text-gray-500">
                  Based on job openings
                </span>
              </div>
              <div className="space-y-4">
                {hiringDomains
                  .sort((a: HiringDomain, b: HiringDomain) => b.openings - a.openings)
                  .map((domain: HiringDomain, index: number) => (
                    <HiringCard
                      key={domain.domain}
                      domain={domain.domain}
                      openings={domain.openings}
                      rank={index + 1}
                    />
                  ))}
              </div>
            </section>
          </div>

          {/* Right Column - Salary Insights & Highlights */}
          <div className="space-y-6">
            {/* Salary Insights */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Salary Comparison
              </h2>
              <SalaryTable salaries={salaryComparison} />
              <div className="mt-4 text-xs text-gray-500">
                <p>India: LPA (Lakhs Per Annum)</p>
                <p>Abroad: USD Thousands per year</p>
              </div>
            </section>

            {/* Highlights Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                What's Hot This Month
              </h2>
              <div className="space-y-4">
                {hotArticles.map((article: HotArticle, index: number) => (
                  <HighlightCard
                    key={index}
                    article={article}
                  />
                ))}
              </div>
            </section>

            {/* Data Source Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Data Sources</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Aggregated from {trendsData.apiSource || 'multiple industry sources'} and internal platform analytics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}