import { getCareerDomains } from '@/actions/careerdomains-students-actions';
import { getCurrentUser } from '@/actions/userActions';
import SearchBar from './components/SearchBar';
import DomainCard from './components/DomainCard';

interface CareerDomainsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function CareerDomainsPage({ searchParams }: CareerDomainsPageProps) {
  // AWAIT the searchParams first to fix the error
  const params = await searchParams;
  const searchQuery = params?.search || '';
  
  const domains = await getCareerDomains(searchQuery);
  const user = await getCurrentUser();

  // Add authentication check like roadmap page
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Student Login Required</h1>
          <p className="text-gray-600 mb-6">Please log in with your student account to access career domains</p>
          <a href="/students-auth/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Student Login
          </a>
        </div>
      </div>
    );
  }

  if (user.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h1>
          <p className="text-gray-600 mb-6">This page is only accessible to students.</p>
          <a href="/dashboard" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Explore Career Domains</h1>
            <p className="text-blue-100 mt-2 text-lg">
              Discover various career paths and find the perfect fit for your skills and interests
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 -mt-4">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <SearchBar initialQuery={searchQuery} />
        </div>

        {/* Stats Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Career Domains Overview</h3>
              <p className="text-gray-600 text-sm mt-1">
                Explore {domains.length} career paths with detailed insights
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{domains.length}</div>
                <div className="text-gray-600">Career Domains</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {domains.reduce((acc, domain) => acc + domain.skills.length, 0)}
                </div>
                <div className="text-gray-600">Total Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {domains.filter(d => d.averageSalary?.india || d.averageSalary?.abroad).length}
                </div>
                <div className="text-gray-600">Salary Data</div>
              </div>
            </div>
          </div>
        </div>

        {/* Domain Grid */}
        {domains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => (
              <DomainCard key={domain._id} domain={domain} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No career domains found' : 'No career domains available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms or check back later for new career domains'
                  : 'Career domains will be available soon. Please check back later.'
                }
              </p>
              {searchQuery && (
                <a
                  href="/students/career-domains"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-block"
                >
                  Clear Search
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}