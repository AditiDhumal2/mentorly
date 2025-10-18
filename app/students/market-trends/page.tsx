import { getTrendsData } from '../../admin/trends/trendsaction';

export default async function MarketTrendsPage() {
  // Fetch data from server actions instead of using static data
  const trendsData = await getTrendsData();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Market Trends
            </h1>
            <p className="text-gray-300">
              Current industry insights and hiring landscape for {trendsData.month}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-sm text-gray-400">
            Last updated: {new Date(trendsData.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            <div className="text-xs text-gray-500 mt-1">
              Source: {trendsData.apiSource}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Trending Skills & Hiring Domains */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trending Skills Section */}
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="text-green-400 mr-2">📈</span>
                Trending Skills
              </h2>
              <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full border border-gray-600/50">
                {trendsData.trendingSkills.length} skills
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendsData.trendingSkills
                .sort((a, b) => b.demandScore - a.demandScore)
                .map((skill, index) => (
                  <div key={skill.id} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 hover:bg-gray-700/80 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' :
                          index === 1 ? 'bg-gray-400/20 text-gray-300 border-gray-400/30' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400 border-orange-400/30' :
                          'bg-green-500/20 text-green-400 border-green-400/30'
                        }`}>
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <h3 className="font-semibold text-white text-sm">{skill.skill}</h3>
                      </div>
                      <span className="text-green-400 text-sm font-bold">{skill.demandScore}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          skill.demandScore >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-600' :
                          skill.demandScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          skill.demandScore >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          'bg-gradient-to-r from-blue-400 to-blue-600'
                        }`}
                        style={{ width: `${skill.demandScore}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Hiring Domains Section */}
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="text-blue-400 mr-2">💼</span>
                Top Hiring Domains
              </h2>
              <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full border border-gray-600/50">
                Based on job openings
              </span>
            </div>
            <div className="space-y-4">
              {trendsData.hiringDomains
                .sort((a, b) => b.openings - a.openings)
                .map((domain, index) => (
                  <div key={domain.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 hover:bg-gray-700/80 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        index === 0 ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' :
                        index === 1 ? 'bg-purple-500/20 text-purple-400 border-purple-400/30' :
                        index === 2 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30' :
                        'bg-indigo-500/20 text-indigo-400 border-indigo-400/30'
                      }`}>
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{domain.domain}</h3>
                        <p className="text-gray-400 text-sm">{domain.openings.toLocaleString()} job openings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-semibold">
                        {Math.round((domain.openings / trendsData.hiringDomains[0].openings) * 100)}%
                      </div>
                      <div className="text-xs text-gray-400">of peak demand</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column - Salary Insights & Highlights */}
        <div className="space-y-8">
          {/* Salary Insights */}
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-yellow-400 mr-2">💰</span>
              Salary Comparison
            </h2>
            <div className="space-y-4">
              {trendsData.salaryComparison.map((salary) => (
                <div key={salary.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50 hover:bg-gray-700/80 transition-colors">
                  <h3 className="font-semibold text-white text-sm mb-3">{salary.role}</h3>
                  <div className="flex justify-between text-sm">
                    <div className="text-center flex-1">
                      <div className="text-cyan-400 font-bold text-lg">₹{salary.india}L</div>
                      <div className="text-gray-400 text-xs mt-1">India/Year</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-green-400 font-bold text-lg">${salary.abroad}k</div>
                      <div className="text-gray-400 text-xs mt-1">Abroad/Year</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-600/50">
                    <div className="text-center text-xs text-gray-400">
                      Difference: ${(salary.abroad * 83 - salary.india * 100000 / 83).toFixed(0)}k
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-400 border-t border-gray-600/50 pt-3">
              <p>• India: LPA (Lakhs Per Annum)</p>
              <p>• Abroad: USD Thousands per year</p>
              <p className="mt-2 text-green-400">💡 Based on current market rates</p>
            </div>
          </div>

          {/* Hot Articles Section */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl shadow-lg border border-purple-400/30 p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-purple-400 mr-2">🔥</span>
              Hot Articles & Insights
            </h2>
            <div className="space-y-4">
              {trendsData.hotArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  className="block p-4 bg-purple-500/10 rounded-lg border border-purple-400/20 hover:bg-purple-500/20 transition-all duration-300 group hover:border-purple-400/40"
                >
                  <h3 className="font-semibold text-white text-sm mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-purple-300 text-xs line-clamp-2">{article.summary}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-purple-400 text-xs">Read more →</span>
                    <span className="text-pink-400 text-xs">New</span>
                  </div>
                </a>
              ))}
              
              {trendsData.hotArticles.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-purple-400 text-lg mb-2">📝</div>
                  <p className="text-purple-300 text-sm">No articles available</p>
                  <p className="text-purple-400/70 text-xs mt-1">Check back later for updates</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-400/30 p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-cyan-400 mr-2">📊</span>
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                <div className="text-cyan-400 font-bold text-lg">
                  {trendsData.trendingSkills.length}
                </div>
                <div className="text-cyan-300 text-xs">Skills Tracked</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                <div className="text-cyan-400 font-bold text-lg">
                  {trendsData.hiringDomains.reduce((sum, domain) => sum + domain.openings, 0).toLocaleString()}
                </div>
                <div className="text-cyan-300 text-xs">Total Openings</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                <div className="text-cyan-400 font-bold text-lg">
                  {trendsData.salaryComparison.length}
                </div>
                <div className="text-cyan-300 text-xs">Roles Compared</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                <div className="text-cyan-400 font-bold text-lg">
                  {trendsData.hotArticles.length}
                </div>
                <div className="text-cyan-300 text-xs">Articles</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Data sourced from {trendsData.apiSource} • 
          Updated automatically when admin makes changes
        </p>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';