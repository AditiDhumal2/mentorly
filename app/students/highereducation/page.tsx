import { getHigherEducationData } from '@/actions/highereducation-students-actions';
import { getCurrentStudent } from '@/actions/userActions';
import ProgressTracker from './components/ProgressTracker';
import CountrySelector from './components/CountrySelector';
import ExamPreparation from './components/ExamPreparation';
import ApplicationDocuments from './components/ApplicationDocuments';
import TA_RAGuide from './components/TA_RAGuide';
import QuickStats from './components/QuickStats';

export default async function HigherEducationPage() {
  // Get student - will be null during build, that's OK
  const user = await getCurrentStudent();
  
  console.log('🎓 Higher Education page - User:', user ? 'Logged in' : 'Not logged in');
  
  // Fetch public data (doesn't require authentication)
  let higherEdData = null;
  
  try {
    higherEdData = await getHigherEducationData();
    console.log('✅ Higher education data loaded:', {
      countries: higherEdData?.countries?.length || 0,
      exams: higherEdData?.examPreparations?.length || 0,
      documents: higherEdData?.applicationDocuments?.length || 0
    });
  } catch (err) {
    console.error('❌ Error loading higher education data:', err);
  }

  // Safe data with fallbacks
  const safeHigherEdData = higherEdData || {
    countries: [],
    examPreparations: [],
    applicationDocuments: [],
  };

  // If user exists, fetch their progress
  let studentProgress = null;
  if (user) {
    try {
      const { getStudentProgress } = await import('@/actions/highereducation-students-actions');
      studentProgress = await getStudentProgress();
    } catch (err) {
      console.error('❌ Error loading student progress:', err);
    }
  }

  return (
    <div className="min-h-full p-4 md:p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Master's Abroad Journey
        </h1>
        <p className="text-gray-600">
          Your personalized roadmap to studying at top universities worldwide
        </p>
        
        {/* Show login status */}
        {user ? (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Logged in as {user.name}
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-amber-600 mb-2">
              Please log in to see your personalized progress
            </p>
            <a 
              href="/students-auth/login" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Log In
            </a>
          </div>
        )}
      </div>

      {/* Data Status */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Available Resources:</strong> 
          <span className="ml-2">🌍 {safeHigherEdData.countries?.length || 0} Countries</span>
          <span className="ml-4">📝 {safeHigherEdData.examPreparations?.length || 0} Exams</span>
          <span className="ml-4">📄 {safeHigherEdData.applicationDocuments?.length || 0} Documents</span>
        </div>
      </div>

      {/* User Progress (only show if user exists) */}
      {user && studentProgress && (
        <div className="mb-6">
          <QuickStats studentProgress={studentProgress} />
          <div className="mt-4">
            <ProgressTracker 
              currentStep={studentProgress.currentStep || 1}
              completedSteps={studentProgress.completedSteps || []}
            />
          </div>
        </div>
      )}

      {/* Public Content (always shows) */}
      <div className="space-y-6">
        {/* Countries Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select Your Target Country</h2>
          <CountrySelector countries={safeHigherEdData.countries} />
        </div>

        {/* Other Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exam Preparation */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Exam Preparation</h2>
            <ExamPreparation exams={safeHigherEdData.examPreparations} />
          </div>

          {/* Application Documents */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Application Documents</h2>
            <ApplicationDocuments documents={safeHigherEdData.applicationDocuments} />
          </div>
        </div>

        {/* TA/RA Guide */}
        <div className="bg-white rounded-xl shadow p-6">
          <TA_RAGuide />
        </div>
      </div>

      {/* Empty State */}
      {safeHigherEdData.countries.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-4xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Getting Started</h3>
          <p className="text-gray-600">
            We're preparing your higher education guidance.
          </p>
        </div>
      )}
    </div>
  );
}