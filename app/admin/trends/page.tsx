import { getTrendsData } from './trendsaction';
import EditTrends from './EditTrends';

export default async function AdminTrendsPage() {
  const trendsData = await getTrendsData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Market Trends Management
            </h1>
            <p className="text-gray-300">
              Update and manage market trends data that students will see
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
          </div>
        </div>
      </div>

      <EditTrends initialData={trendsData} />

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
          <div className="text-cyan-400 font-bold text-lg">
            {trendsData.trendingSkills.length}
          </div>
          <div className="text-cyan-300 text-xs">Skills</div>
        </div>
        <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-400/20">
          <div className="text-green-400 font-bold text-lg">
            {trendsData.hiringDomains.length}
          </div>
          <div className="text-green-300 text-xs">Domains</div>
        </div>
        <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
          <div className="text-yellow-400 font-bold text-lg">
            {trendsData.salaryComparison.length}
          </div>
          <div className="text-yellow-300 text-xs">Salaries</div>
        </div>
        <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
          <div className="text-purple-400 font-bold text-lg">
            {trendsData.hotArticles.length}
          </div>
          <div className="text-purple-300 text-xs">Articles</div>
        </div>
      </div>
    </div>
  );
}