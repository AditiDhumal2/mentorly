import { CareerDomainsStats } from '@/types/careerDomains';
import { Target, TrendingUp, BookOpen, Users } from 'lucide-react';

interface StatsOverviewProps {
  stats: CareerDomainsStats | null;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats?.totalDomains || 0}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">Total Domains</div>
            <div className="text-xs text-gray-500 mt-1">Active career paths</div>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-600">{stats?.domainsWithSalary || 0}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">With Salary Data</div>
            <div className="text-xs text-gray-500 mt-1">Complete profiles</div>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-purple-600">{stats?.averageSkillsPerDomain || 0}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">Avg Skills</div>
            <div className="text-xs text-gray-500 mt-1">Per domain</div>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Top Skills</div>
            <div className="text-xs text-gray-600 mt-2 line-clamp-2">
              {stats?.mostCommonSkills.slice(0, 3).join(', ') || 'No data yet'}
            </div>
            <div className="text-xs text-gray-500 mt-2">Most popular</div>
          </div>
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}