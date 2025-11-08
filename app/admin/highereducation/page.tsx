import { getHigherEducationData, getStudentProgress } from '@/actions/highereducation-admin-actions';
import DataManagementTabs from './components/DataManagementTabs';
import StudentProgressOverview from './components/StudentProgressOverview';
import AdminStats from './components/AdminStats';
import { HigherEducationData, StudentProgress } from '@/types/higher-education';

export default async function AdminHigherEducationPage() {
  let higherEdData: HigherEducationData;
  let studentProgress: StudentProgress[] = [];

  try {
    // Fetch data in parallel
    const [higherEdDataResult, studentProgressResult] = await Promise.all([
      getHigherEducationData(),
      getStudentProgress()
    ]);

    higherEdData = higherEdDataResult;
    studentProgress = studentProgressResult || [];

    console.log('📦 Page loaded data:', {
      countries: higherEdData?.countries?.length || 0,
      exams: higherEdData?.examPreparations?.length || 0,
      documents: higherEdData?.applicationDocuments?.length || 0,
      taRaGuides: higherEdData?.taRaGuides?.length || 0,
      studentProgress: studentProgress?.length || 0
    });
  } catch (error) {
    console.error('❌ Error loading admin page data:', error);
    // Fallback data
    higherEdData = {
      countries: [],
      examPreparations: [],
      applicationDocuments: [],
      studentProgress: [],
      taRaGuides: []
    };
    studentProgress = [];
  }

  // Ensure studentProgress is always an array
  const safeStudentProgress: StudentProgress[] = Array.isArray(studentProgress) ? studentProgress : [];

  // Create the data object in the expected format
  const tabData: HigherEducationData & { taRaGuides?: any[] } = {
    countries: higherEdData?.countries || [],
    examPreparations: higherEdData?.examPreparations || [],
    applicationDocuments: higherEdData?.applicationDocuments || [],
    studentProgress: safeStudentProgress,
    taRaGuides: higherEdData?.taRaGuides || []
  };

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
          <DataManagementTabs data={tabData} />
        </div>
      </div>
    </div> 
  );
}