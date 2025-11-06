'use client';

import { StudentProgress } from '@/types/higher-education';

interface StudentProgressOverviewProps {
  progressData: StudentProgress[];
}

export default function StudentProgressOverview({ progressData }: StudentProgressOverviewProps) {
  // Helper function to safely render student information
  const renderStudentInfo = (progress: StudentProgress) => {
    if (!progress.userId) {
      return 'Unknown Student';
    }

    // If userId is an object (populated user), use the name from it
    if (typeof progress.userId === 'object' && progress.userId !== null) {
      const user = progress.userId as any;
      return (
        <div>
          <div className="font-semibold text-gray-900">
            {user.name || 'Unknown Student'}
          </div>
          <div className="text-sm text-gray-600">
            {user.email || 'No email'}
          </div>
          <div className="text-xs text-gray-500">
            Year {user.year || 'N/A'} • {user.college || 'No college'}
          </div>
        </div>
      );
    }

    // If userId is just a string ID
    return (
      <div>
        <div className="font-semibold text-gray-900">
          Student ID: {progress.userId.toString().slice(-8)}
        </div>
        <div className="text-sm text-gray-600">
          ID: {progress.userId}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Student Progress Overview</h2>
      
      <div className="space-y-4">
        {progressData.map((progress, index) => (
          <div key={progress._id || `progress-${index}`} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {renderStudentInfo(progress)}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Completed: {progress.completedSteps?.length || 0}/5 steps
                </p>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${((progress.completedSteps?.length || 0) / 5) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Documents:</span>
                <span className="ml-2">
                  {progress.documents?.filter((d: any) => d.status === 'completed').length || 0}/
                  {progress.documents?.length || 0} completed
                </span>
              </div>
              <div>
                <span className="font-medium">Applications:</span>
                <span className="ml-2">
                  {progress.applications?.filter((a: any) => a.status === 'applied').length || 0} submitted
                </span>
              </div>
            </div>

            {/* Current Step */}
            <div className="mt-2">
              <span className="font-medium text-sm">Current Step:</span>
              <span className="ml-2 text-sm text-gray-600">
                {progress.currentStep || 1}
              </span>
            </div>

            {/* Exam Scores Summary */}
            {progress.examScores && (
              <div className="mt-2">
                <span className="font-medium text-sm">Exam Scores:</span>
                <div className="flex space-x-4 mt-1 text-xs">
                  {progress.examScores.gre && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      GRE: {progress.examScores.gre.total || 'N/A'}
                    </span>
                  )}
                  {progress.examScores.ielts && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      IELTS: {progress.examScores.ielts.overall || 'N/A'}
                    </span>
                  )}
                  {progress.examScores.toefl && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      TOEFL: {progress.examScores.toefl.total || 'N/A'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {progressData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No student progress data available
        </div>
      )}

      {/* Summary Stats */}
      {progressData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{progressData.length}</div>
              <div className="text-blue-800">Total Students</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {progressData.filter(p => (p.completedSteps?.length || 0) >= 3).length}
              </div>
              <div className="text-green-800">Active Progress</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {progressData.filter(p => p.applications?.some((a: any) => a.status === 'applied')).length}
              </div>
              <div className="text-purple-800">Applied Students</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}