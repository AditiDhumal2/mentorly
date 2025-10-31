import { getTrendsData } from './trendsaction';
import EditTrends from './EditTrends';

export default async function AdminTrendsPage() {
  const trendsData = await getTrendsData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl overflow-hidden p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      Market Trends Dashboard
                    </h1>
                    <p className="text-purple-100 text-lg font-medium">
                      Update and manage market trends data that students will see
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-0">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="text-white text-sm font-medium mb-1">Last Updated</div>
                    <div className="text-white font-bold text-lg">
                      {new Date(trendsData.updatedAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-purple-100 text-sm">
                      {new Date(trendsData.updatedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EditTrends initialData={trendsData} />

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="text-purple-600 font-bold text-2xl mb-2">
              {trendsData.trendingSkills.length}
            </div>
            <div className="text-purple-700 font-semibold text-sm">Trending Skills</div>
            <div className="text-purple-400 text-xs mt-1">Active in market</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition-shadow">
            <div className="text-pink-600 font-bold text-2xl mb-2">
              {trendsData.hiringDomains.length}
            </div>
            <div className="text-pink-700 font-semibold text-sm">Hiring Domains</div>
            <div className="text-pink-400 text-xs mt-1">High demand areas</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-indigo-100 hover:shadow-xl transition-shadow">
            <div className="text-indigo-600 font-bold text-2xl mb-2">
              {trendsData.salaryComparison.length}
            </div>
            <div className="text-indigo-700 font-semibold text-sm">Salary Comparisons</div>
            <div className="text-indigo-400 text-xs mt-1">India vs Abroad</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-rose-100 hover:shadow-xl transition-shadow">
            <div className="text-rose-600 font-bold text-2xl mb-2">
              {trendsData.hotArticles.length}
            </div>
            <div className="text-rose-700 font-semibold text-sm">Hot Articles</div>
            <div className="text-rose-400 text-xs mt-1">Latest insights</div>
          </div>
        </div>
      </div>
    </div>
  );
}