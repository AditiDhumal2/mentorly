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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Explore Career Domains
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover various career paths and find the perfect fit for your skills and interests
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar initialQuery={searchQuery} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{domains.length}</div>
          <div className="text-sm text-gray-600">Career Domains</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200/50 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {domains.reduce((acc, domain) => acc + domain.skills.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Skills</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {domains.filter(d => d.averageSalary?.india || d.averageSalary?.abroad).length}
          </div>
          <div className="text-sm text-gray-600">Salary Data Available</div>
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
        <div className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchQuery ? 'No career domains found' : 'No career domains available'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery 
              ? 'Try adjusting your search terms or check back later for new career domains'
              : 'Career domains will be available soon. Please check back later.'
            }
          </p>
        </div>
      )}
    </div>
  );
}