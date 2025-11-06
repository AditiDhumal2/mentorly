// app/students/highereducation/page.tsx
import { getHigherEducationData, getStudentProgress } from '@/actions/highereducation-students-actions';
import { requireStudentAuth } from '@/actions/userActions';
import ProgressTracker from './components/ProgressTracker';
import CountrySelector from './components/CountrySelector';
import ExamPreparation from './components/ExamPreparation';
import ApplicationDocuments from './components/ApplicationDocuments';
import TA_RAGuide from './components/TA_RAGuide';
import QuickStats from './components/QuickStats';

export default async function HigherEducationPage() {
  // Verify student authentication
  const user = await requireStudentAuth();
  
  console.log('🎓 Starting Higher Education page load for user:', user?._id);
  
  // Fetch data with error handling
  let higherEdData = null;
  let studentProgress = null;
  let error = null;

  try {
    console.log('📡 Fetching data via Server Actions...');
    
    [higherEdData, studentProgress] = await Promise.all([
      getHigherEducationData(),
      getStudentProgress()
    ]);
    
    console.log('✅ Data fetched successfully:', {
      countries: higherEdData?.countries?.length || 0,
      exams: higherEdData?.examPreparations?.length || 0,
      documents: higherEdData?.applicationDocuments?.length || 0,
      hasProgress: !!studentProgress
    });
    
  } catch (err) {
    console.error('❌ Error in Higher Education page:', err);
    error = 'Failed to load data. Please try again later.';
  }

  // Safe data with fallbacks
  const safeHigherEdData = higherEdData || {
    countries: [],
    examPreparations: [],
    applicationDocuments: [],
    studentProgress: []
  };

  // Calculate profile strength based on progress
  const calculateProfileStrength = (progress: any) => {
    if (!progress) return 25;
    
    let strength = 25; // Base strength
    
    // Add points for completed steps
    if (progress.completedSteps && progress.completedSteps.length > 0) {
      strength += progress.completedSteps.length * 10;
    }
    
    // Add points for completed documents
    if (progress.documents) {
      const completedDocs = progress.documents.filter((doc: any) => doc.status === 'completed').length;
      strength += completedDocs * 5;
    }
    
    // Add points for applications
    if (progress.applications && progress.applications.length > 0) {
      strength += progress.applications.length * 3;
    }
    
    return Math.min(strength, 100);
  };

  // Enhance student progress with calculated profile strength
  const enhancedStudentProgress = studentProgress ? {
    ...studentProgress,
    profileStrength: calculateProfileStrength(studentProgress)
  } : null;

  console.log('📊 Enhanced student progress:', {
    profileStrength: enhancedStudentProgress?.profileStrength,
    currentStep: enhancedStudentProgress?.currentStep,
    completedSteps: enhancedStudentProgress?.completedSteps?.length
  });

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3">
          <span className="text-2xl text-white">🎓</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Master's Abroad Journey
        </h1>
        <p className="text-gray-600">
          Your personalized roadmap to studying at top universities worldwide
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-red-600 font-semibold mb-1 text-sm">⚠️ {error}</div>
          <p className="text-red-500 text-xs">Please refresh the page or contact support if the issue persists.</p>
        </div>
      )}

      {/* Data Loading Status */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-xs text-blue-700">
          <strong>Data Status:</strong> 
          Countries: {safeHigherEdData.countries?.length || 0} | 
          Exams: {safeHigherEdData.examPreparations?.length || 0} | 
          Documents: {safeHigherEdData.applicationDocuments?.length || 0} |
          Profile: {enhancedStudentProgress ? `${enhancedStudentProgress.profileStrength}%` : 'Not Found'}
        </div>
      </div>

      {/* Compact Horizontal Stats */}
      <div className="mb-6">
        <QuickStats studentProgress={enhancedStudentProgress} />
      </div>

      {/* Progress Section */}
      {enhancedStudentProgress && (
        <div className="mb-6">
          <ProgressTracker 
            currentStep={enhancedStudentProgress.currentStep || 1}
            completedSteps={enhancedStudentProgress.completedSteps || []}
          />
        </div>
      )}

      {/* Countries Section */}
      <div className="mb-6">
        <CountrySelector countries={safeHigherEdData.countries} />
      </div>

      {/* Other Sections */}
      <div className="space-y-6">
        {/* TA/RA Guide */}
        <TA_RAGuide />
        
        {/* Exam Preparation */}
        <ExamPreparation exams={safeHigherEdData.examPreparations} />
        
        {/* Application Documents */}
        <ApplicationDocuments documents={safeHigherEdData.applicationDocuments} />
      </div>

      {/* Empty State if no data */}
      {!error && safeHigherEdData.countries.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-4xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Getting Started with Your MS Abroad Journey</h3>
          <p className="text-gray-600 mb-4">
            We're preparing your personalized higher education guidance.
          </p>
          <div className="text-sm text-gray-500">
            Start by exploring countries and universities that match your goals.
          </div>
        </div>
      )}
    </div>
  );
}