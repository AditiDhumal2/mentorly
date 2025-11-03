// app/admin/careerdomains/page.tsx
import { 
  getAllCareerDomains, 
  getCareerDomainsStats, 
  createCareerDomainAction  // Import the wrapper action instead
} from '@/actions/careerdomain-admin-actions';
import AdminDomainTable from './components/AdminDomainTable';
import StatsOverview from './components/StatsOverview';
import EmptyState from './components/EmptyState';
import { ICareerDomain, CareerDomainsStats } from '@/types/careerDomains';

interface SearchParams {
  search?: string;
}

interface AdminCareerDomainsPageProps {
  searchParams: Promise<SearchParams>;
}

// Extended stats interface with calculated properties
interface ExtendedCareerDomainsStats extends CareerDomainsStats {
  totalSkills?: number;
  activeDomains?: number;
  averageSkills?: number;
}

export default async function AdminCareerDomainsPage({ searchParams }: AdminCareerDomainsPageProps) {
  // Await the searchParams promise first
  const params = await searchParams;
  const searchTerm = params.search || '';
  
  // Load data on the server
  const [domains, stats] = await Promise.all([
    getAllCareerDomains(),
    getCareerDomainsStats()
  ]);

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate stats
  const totalSkills = domains.reduce((acc, domain) => acc + domain.skills.length, 0);
  const activeDomains = domains.length; // All domains are considered active
  const averageSkills = domains.length > 0 ? Math.round(totalSkills / domains.length) : 0;

  // Create enhanced stats object
  const enhancedStats: ExtendedCareerDomainsStats = {
    ...stats,
    totalDomains: domains.length,
    totalSkills,
    activeDomains,
    averageSkills
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                      <span className="text-2xl">💼</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      Career Domains Management
                    </h1>
                    <p className="text-indigo-100 text-lg font-medium">
                      Manage career domains, skills, and industry pathways for students
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-0">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="text-white text-sm font-medium mb-1">System Overview</div>
                    <div className="text-white font-bold text-lg">
                      {enhancedStats.totalDomains} Career Domains
                    </div>
                    <div className="text-indigo-100 text-sm">
                      {enhancedStats.totalSkills} skills across {enhancedStats.activeDomains} domains
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={enhancedStats} />
        
        {/* Search Filters - Pure HTML Form */}
        {domains.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <form>
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      placeholder="Search domains, skills, or descriptions..."
                      defaultValue={searchTerm}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      suppressHydrationWarning
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </form>
              </div>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                Showing {filteredDomains.length} of {domains.length} domains
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Create Domain Form Sidebar - Using Server Action Wrapper */}
          <div className="xl:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 sticky top-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Domain</h3>
                {/* FIXED: Using the wrapper action that returns void */}
                <form action={createCareerDomainAction} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Domain Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Web Development"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe this career domain..."
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                      Skills (comma separated)
                    </label>
                    <textarea
                      id="skills"
                      name="skills"
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="JavaScript, React, Node.js, ..."
                      suppressHydrationWarning
                    />
                  </div>
                  {/* Optional fields - you can add these later */}
                  <div>
                    <label htmlFor="tools" className="block text-sm font-medium text-gray-700 mb-1">
                      Tools (comma separated)
                    </label>
                    <textarea
                      id="tools"
                      name="tools"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="VS Code, Git, Docker, ..."
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label htmlFor="salaryIndia" className="block text-sm font-medium text-gray-700 mb-1">
                      Average Salary in India
                    </label>
                    <input
                      type="text"
                      id="salaryIndia"
                      name="salaryIndia"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., ₹8-15 LPA"
                      suppressHydrationWarning
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    suppressHydrationWarning
                  >
                    Create Domain
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Domains Table */}
          <div className="xl:col-span-3">
            {domains.length > 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <AdminDomainTable 
                  domains={filteredDomains}
                />
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* No Search Results */}
        {filteredDomains.length === 0 && domains.length > 0 && (
          <div className="mt-6">
            <EmptyState 
              type="search"
              title="No domains found"
              description="Try adjusting your search terms to find what you're looking for."
            />
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-indigo-100 hover:shadow-xl transition-shadow">
            <div className="text-indigo-600 font-bold text-2xl mb-2">
              {enhancedStats.totalDomains}
            </div>
            <div className="text-indigo-700 font-semibold text-sm">Career Domains</div>
            <div className="text-indigo-400 text-xs mt-1">Total available</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="text-green-600 font-bold text-2xl mb-2">
              {enhancedStats.activeDomains}
            </div>
            <div className="text-green-700 font-semibold text-sm">Active Domains</div>
            <div className="text-green-400 text-xs mt-1">Currently active</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="text-purple-600 font-bold text-2xl mb-2">
              {enhancedStats.totalSkills}
            </div>
            <div className="text-purple-700 font-semibold text-sm">Total Skills</div>
            <div className="text-purple-400 text-xs mt-1">Across all domains</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="text-blue-600 font-bold text-2xl mb-2">
              {enhancedStats.averageSkills}
            </div>
            <div className="text-blue-700 font-semibold text-sm">Avg Skills</div>
            <div className="text-blue-400 text-xs mt-1">Per domain</div>
          </div>
        </div>
      </div>
    </div>
  );
}