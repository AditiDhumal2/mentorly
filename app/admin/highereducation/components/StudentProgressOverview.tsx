// app/admin/highereducation/components/StudentProgressOverview.tsx
'use client';

import { useState } from 'react';

interface StudentProgressOverviewProps {
  progressData: any[];
}

export default function StudentProgressOverview({ progressData }: StudentProgressOverviewProps) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = progressData.filter(student =>
    student.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressPercentage = (student: any) => {
    if (!student.completedSteps) return 0;
    return Math.round((student.completedSteps.length / 5) * 100);
  };

  const getDocumentStatusCount = (student: any, status: string) => {
    if (!student.documents) return 0;
    return student.documents.filter((doc: any) => doc.status === status).length;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get top 6 students for compact view
  const displayStudents = filteredStudents.slice(0, 6);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Progress Overview</h2>
            <p className="text-gray-600 text-sm mt-1">
              Quick overview of student application progress ({filteredStudents.length} total students)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Showing {Math.min(displayStudents.length, 6)} of {filteredStudents.length}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Students Grid */}
      <div className="p-6">
        {displayStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No students found matching your search
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayStudents.map((student, index) => (
              <div
                key={student._id || index}
                className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedStudent?._id === student._id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                {/* Student Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {student.userId?.name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {student.userId?.name || 'Unknown Student'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {student.userId?.email || 'No email'}
                    </p>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {getProgressPercentage(student)}%
                    </div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {getDocumentStatusCount(student, 'completed')}/{student.documents?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Docs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {student.applications?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Apps</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Step {student.currentStep || 1}/5</span>
                    <span>{student.completedSteps?.length || 0}/5 done</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStatusColor(getProgressPercentage(student))} transition-all duration-300`}
                      style={{ width: `${getProgressPercentage(student)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Quick Status */}
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    getProgressPercentage(student) >= 80 ? 'bg-green-100 text-green-800' :
                    getProgressPercentage(student) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getProgressPercentage(student) >= 80 ? 'On Track' :
                     getProgressPercentage(student) >= 50 ? 'In Progress' : 'Needs Help'}
                  </span>
                  <span className="text-gray-500">
                    {student.userId?.college ? student.userId.college.substring(0, 12) + '...' : 'No college'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button if more than 6 students */}
        {filteredStudents.length > 6 && (
          <div className="text-center mt-4">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All {filteredStudents.length} Students →
            </button>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Student Details</h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedStudent.userId?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedStudent.userId?.email || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">College:</span>
                      <span className="font-medium">{selectedStudent.userId?.college || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">{selectedStudent.userId?.year || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Progress Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Step:</span>
                      <span className="font-medium">{selectedStudent.currentStep || 1}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Steps:</span>
                      <span className="font-medium">{selectedStudent.completedSteps?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profile Strength:</span>
                      <span className="font-medium">{selectedStudent.profileStrength || 25}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Universities:</span>
                      <span className="font-medium">{selectedStudent.targetUniversities?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Status */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Document Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedStudent.documents?.map((doc: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                          doc.status === 'reviewing' ? 'bg-blue-100 text-blue-800' :
                          doc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">University Applications</h4>
                {selectedStudent.applications?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.applications.map((app: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{app.universityName}</span>
                            <span className="text-xs text-gray-500 ml-2">({app.program})</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            app.status === 'admitted' ? 'bg-green-100 text-green-800' :
                            app.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Deadline: {new Date(app.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No applications yet</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                  Contact Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}