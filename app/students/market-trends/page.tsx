import { getTrendsData } from '../../admin/trends/trendsaction';

export default async function MarketTrendsPage() {
  // Fetch data from server actions instead of using static data
  const trendsData = await getTrendsData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Market Trends</h1>
            <p className="text-blue-100 mt-2 text-lg">
              Current industry insights and hiring landscape for {trendsData.month}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 -mt-4">
        {/* Stats Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Market Overview</h3>
              <p className="text-gray-600 text-sm mt-1">
                Real-time industry insights and salary trends
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{trendsData.trendingSkills.length}</div>
                <div className="text-gray-600">Skills Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {trendsData.hiringDomains.reduce((sum, domain) => sum + domain.openings, 0).toLocaleString()}
                </div>
                <div className="text-gray-600">Total Openings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {trendsData.salaryComparison.length}
                </div>
                <div className="text-gray-600">Roles Compared</div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              Last updated: {new Date(trendsData.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              <div className="text-xs mt-1">
                Source: {trendsData.apiSource}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trending Skills & Hiring Domains */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending Skills Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="text-green-600 mr-2">📈</span>
                  Trending Skills
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  {trendsData.trendingSkills.length} skills
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendsData.trendingSkills
                  .sort((a, b) => b.demandScore - a.demandScore)
                  .map((skill, index) => (
                    <div key={skill.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            index === 0 ? 'bg-yellow-100 text-yellow-600 border-yellow-200' :
                            index === 1 ? 'bg-gray-100 text-gray-600 border-gray-200' :
                            index === 2 ? 'bg-orange-100 text-orange-600 border-orange-200' :
                            'bg-green-100 text-green-600 border-green-200'
                          }`}>
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm">{skill.skill}</h3>
                        </div>
                        <span className="text-green-600 text-sm font-bold">{skill.demandScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            skill.demandScore >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            skill.demandScore >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            skill.demandScore >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                            'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                          style={{ width: `${skill.demandScore}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Hiring Domains Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="text-blue-600 mr-2">💼</span>
                  Top Hiring Domains
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  Based on job openings
                </span>
              </div>
              <div className="space-y-4">
                {trendsData.hiringDomains
                  .sort((a, b) => b.openings - a.openings)
                  .map((domain, index) => (
                    <div key={domain.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                          index === 0 ? 'bg-blue-100 text-blue-600 border-blue-200' :
                          index === 1 ? 'bg-purple-100 text-purple-600 border-purple-200' :
                          index === 2 ? 'bg-cyan-100 text-cyan-600 border-cyan-200' :
                          'bg-indigo-100 text-indigo-600 border-indigo-200'
                        }`}>
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{domain.domain}</h3>
                          <p className="text-gray-600 text-sm">{domain.openings.toLocaleString()} job openings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-600 font-semibold">
                          {Math.round((domain.openings / trendsData.hiringDomains[0].openings) * 100)}%
                        </div>
                        <div className="text-xs text-gray-500">of peak demand</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column - Salary Insights & Highlights */}
          <div className="space-y-6">
            {/* Salary Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="text-yellow-600 mr-2">💰</span>
                Salary Comparison
              </h2>
              <div className="space-y-4">
                {trendsData.salaryComparison.map((salary) => (
                  <div key={salary.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                    <h3 className="font-semibold text-gray-900 text-sm mb-3">{salary.role}</h3>
                    <div className="flex justify-between text-sm">
                      <div className="text-center flex-1">
                        <div className="text-cyan-600 font-bold text-lg">₹{salary.india}L</div>
                        <div className="text-gray-600 text-xs mt-1">India/Year</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-green-600 font-bold text-lg">${salary.abroad}k</div>
                        <div className="text-gray-600 text-xs mt-1">Abroad/Year</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-center text-xs text-gray-500">
                        Difference: ${(salary.abroad * 83 - salary.india * 100000 / 83).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500 border-t border-gray-200 pt-3">
                <p>• India: LPA (Lakhs Per Annum)</p>
                <p>• Abroad: USD Thousands per year</p>
                <p className="mt-2 text-green-600">💡 Based on current market rates</p>
              </div>
            </div>

            {/* Hot Articles Section */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="text-purple-600 mr-2">🔥</span>
                Hot Articles & Insights
              </h2>
              <div className="space-y-4">
                {trendsData.hotArticles.map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    className="block p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-all duration-200 group hover:border-purple-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-xs line-clamp-2">{article.summary}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-purple-600 text-xs">Read more →</span>
                      <span className="text-pink-600 text-xs">New</span>
                    </div>
                  </a>
                ))}
                
                {trendsData.hotArticles.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-purple-500 text-lg mb-2">📝</div>
                    <p className="text-purple-600 text-sm">No articles available</p>
                    <p className="text-purple-400 text-xs mt-1">Check back later for updates</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="text-blue-600 mr-2">📊</span>
                Quick Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-blue-600 font-bold text-lg">
                    {trendsData.trendingSkills.length}
                  </div>
                  <div className="text-blue-600 text-xs">Skills Tracked</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-blue-600 font-bold text-lg">
                    {trendsData.hiringDomains.reduce((sum, domain) => sum + domain.openings, 0).toLocaleString()}
                  </div>
                  <div className="text-blue-600 text-xs">Total Openings</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-blue-600 font-bold text-lg">
                    {trendsData.salaryComparison.length}
                  </div>
                  <div className="text-blue-600 text-xs">Roles Compared</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-blue-600 font-bold text-lg">
                    {trendsData.hotArticles.length}
                  </div>
                  <div className="text-blue-600 text-xs">Articles</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Footer */}
        <div className="mt-8 text-center border-t border-gray-200 pt-6">
          <p className="text-gray-500 text-sm">
            Data sourced from {trendsData.apiSource} • 
            Updated automatically when admin makes changes
          </p>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';