import { getCareerDomainBySlug, getCareerDomains } from '@/actions/careerdomains-students-actions';
import { getCurrentUser } from '@/actions/userActions';
import DomainDetails from '../components/DomainDetails';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ICareerDomain } from '@/types/careerDomains';

interface CareerDomainPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Helper function to find domain by slug
async function findDomainBySlug(slug: string): Promise<ICareerDomain | null> {
  console.log('🔍 Searching for domain with slug:', slug);
  
  // First try exact match
  let domain = await getCareerDomainBySlug(slug);
  console.log('📊 Exact match result:', domain ? `Found: ${domain.name}` : 'Not found');
  
  if (!domain) {
    // If exact match fails, try direct name matching
    console.log('🔎 Trying direct name matching...');
    const allDomains = await getCareerDomains('');
    console.log('📋 Total domains available:', allDomains.length);
    
    // Find domain by comparing slugs directly
    const foundDomain = allDomains.find((d: ICareerDomain) => {
      const domainSlug = d.name.toLowerCase().replace(/\s+/g, '-');
      return domainSlug === slug;
    });
    
    console.log('🎯 Direct match result:', foundDomain ? `Found: ${foundDomain.name}` : 'Not found');
    
    // Convert undefined to null
    domain = foundDomain || null;
  }
  
  return domain;
}

export default async function CareerDomainPage({ params }: CareerDomainPageProps) {
  const { slug } = await params;
  
  console.log('🚀 CareerDomainPage loaded with slug:', slug);
  
  const domain = await findDomainBySlug(slug);
  const user = await getCurrentUser();

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Required</h1>
          <p className="text-gray-600 mb-6">Please log in as a student to view career domains</p>
          <a href="/students-auth/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Student Login
          </a>
        </div>
      </div>
    );
  }

  if (!domain) {
    console.log('❌ Domain not found, showing 404 page');
    // Show helpful 404 page with links to existing domains
    const allDomains = await getCareerDomains('');
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <Link 
                  href="/students/careerdomains"
                  className="inline-flex items-center space-x-2 text-blue-100 hover:text-white font-medium transition-colors mb-4"
                >
                  <span>←</span>
                  <span>Back to Career Domains</span>
                </Link>
                <h1 className="text-4xl font-bold">Domain Not Found</h1>
                <p className="text-blue-100 mt-2 text-lg">
                  The career domain "{slug}" doesn't exist
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 -mt-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Career Domain Not Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find a career domain matching "<span className="font-medium">{slug}</span>".
            </p>
            
            {allDomains.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Career Domains:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allDomains.slice(0, 6).map((domain: ICareerDomain) => (
                    <Link
                      key={domain._id}
                      href={`/students/careerdomains/${domain.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-blue-700 font-medium"
                    >
                      {domain.name}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/students/careerdomains"
                  className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  View All Career Domains
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Domain found, rendering details:', domain.name);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/students/careerdomains"
                className="inline-flex items-center space-x-2 text-blue-100 hover:text-white font-medium transition-colors mb-4"
              >
                <span>←</span>
                <span>Back to Career Domains</span>
              </Link>
              <h1 className="text-4xl font-bold">{domain.name}</h1>
              <p className="text-blue-100 mt-2 text-lg">
                Explore career opportunities, skills, and salary insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 -mt-4">
        <DomainDetails domain={domain} />
      </div>
    </div>
  );
}