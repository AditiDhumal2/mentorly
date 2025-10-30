// app/students/careerdomains/[slug]/page.tsx - FIXED VERSION
import { getCareerDomainBySlug } from '@/actions/careerdomains-students-actions';
import { getCurrentUser } from '@/actions/userActions';
import DomainDetails from '../components/DomainDetails';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface CareerDomainPageProps {
  params: {
    slug: string;
  };
}

export default async function CareerDomainPage({ params }: CareerDomainPageProps) {
  const domain = await getCareerDomainBySlug(params.slug);
  const user = await getCurrentUser();

  if (!user || user.role !== 'student') {
    // Add authentication check
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
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
    notFound();
  }

  // REMOVE DashboardLayout wrapper
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          href="/students/careerdomains"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-200/50 hover:border-blue-300/50"
        >
          <span>←</span>
          <span>Back to Career Domains</span>
        </Link>
      </div>
      
      <DomainDetails domain={domain} />
    </div>
  );
}