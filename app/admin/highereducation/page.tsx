// app/admin/highereducation/page.tsx
import { getHigherEducationData, getAllStudentProgress } from '@/actions/highereducation-admin-actions';
import DataManagementTabs from './components/DataManagementTabs';
import StudentProgressOverview from './components/StudentProgressOverview';
import AdminStats from './components/AdminStats';

export default async function AdminHigherEducationPage() {
  const [higherEdData, studentProgress] = await Promise.all([
    getHigherEducationData(),
    getAllStudentProgress()
  ]);

  // Ensure studentProgress is always an array
  const safeStudentProgress = Array.isArray(studentProgress) ? studentProgress : [];

  // Ensure countries have proper structure and unique IDs
  const safeCountries = (higherEdData.countries || []).map((country: any) => ({
    ...country,
    _id: country._id || `country-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    topInstitutes: country.popularUniversities || [], // Map popularUniversities to topInstitutes
    visaRequirements: country.visaRequirements || [],
    costOfLiving: country.costOfLiving || { monthly: '$0', yearly: '$0' },
    taRaGuide: country.taRaGuide || {
      eligibility: ['Full-time enrollment in graduate program'],
      requirements: ['CV/Resume', 'Statement of purpose'],
      applicationProcess: ['Apply to graduate program'],
      tips: ['Contact professors early'],
      documentsRequired: ['Updated CV', 'Academic transcripts'],
      averageStipend: '$1,500 - $2,500/month'
    },
    popularity: country.popularity || 'medium'
  }));

  // Ensure exams and documents have proper structure
  const safeExams = higherEdData.examPreparations || [];
  const safeDocuments = higherEdData.applicationDocuments || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Higher Education Admin</h1>
          <p className="text-gray-600 mt-2">Manage countries, exams, documents, and track student progress</p>
        </div>
        
        {/* Stats Overview */}
        <AdminStats 
          higherEdData={higherEdData} 
          studentProgress={safeStudentProgress} 
        />

        {/* Student Progress Overview - Horizontal above Data Management */}
        <div className="mb-8">
          <StudentProgressOverview progressData={safeStudentProgress} />
        </div>

        {/* Data Management Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <DataManagementTabs 
            countries={safeCountries}
            exams={safeExams}
            documents={safeDocuments}
          />
        </div>
      </div>
    </div>
  );
}