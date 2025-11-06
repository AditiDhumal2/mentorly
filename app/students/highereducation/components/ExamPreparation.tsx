'use client';

import { useState } from 'react';
import { ExamPreparation as ExamPrepType } from '@/types/higher-education';
import { saveExamScores } from '@/actions/highereducation-students-actions';

interface ExamPreparationProps {
  exams: ExamPrepType[];
}

interface ScoresState {
  gre: {
    quant: number;
    verbal: number;
    awa: number;
    total: number;
  };
  ielts: {
    overall: number;
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
  toefl: {
    total: number;
  };
}

export default function ExamPreparation({ exams }: ExamPreparationProps) {
  const [selectedExam, setSelectedExam] = useState<ExamPrepType | null>(null);
  const [scores, setScores] = useState<ScoresState>({
    gre: { quant: 0, verbal: 0, awa: 0, total: 0 },
    ielts: { overall: 0, listening: 0, reading: 0, writing: 0, speaking: 0 },
    toefl: { total: 0 }
  });

  // Helper function for unique keys
  const getExamKey = (exam: ExamPrepType, index: number) => {
    return exam._id || `exam-${index}`;
  };

  const getWeekKey = (week: any, index: number) => {
    return week._id || `week-${index}`;
  };

  const getResourceKey = (resource: any, index: number) => {
    return resource._id || `resource-${index}`;
  };

  const handleSaveScores = async (examType: string) => {
    try {
      await saveExamScores(scores);
      alert('Scores saved successfully!');
    } catch (error) {
      alert('Failed to save scores');
    }
  };

  const handleScoreChange = (examType: keyof ScoresState, section: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [examType]: {
        ...prev[examType],
        [section]: value
      }
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Exam Preparation</h2>
      
      {/* Exam Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {exams.map((exam, index) => (
          <div
            key={getExamKey(exam, index)}
            className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
              selectedExam?._id === exam._id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:shadow-md'
            }`}
            onClick={() => setSelectedExam(exam)}
          >
            <h3 className="font-bold text-gray-800">{exam.examType.toUpperCase()}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Target: {exam.recommendedScore.competitive}+
            </p>
          </div>
        ))}
      </div>

      {selectedExam && (
        <div className="space-y-6">
          {/* Study Plan */}
          <div>
            <h3 className="text-xl font-bold mb-4">{selectedExam.examType.toUpperCase()} Study Plan</h3>
            <div className="space-y-3">
              {selectedExam.studyPlan.map((week, index) => (
                <div key={getWeekKey(week, index)} className="border rounded-lg p-4">
                  <h4 className="font-semibold">Week {week.week}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Topics: {week.topics.join(', ')}
                  </p>
                  <div className="mt-2">
                    <h5 className="font-medium text-sm">Resources:</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {week.resources.map((resource, resourceIndex) => (
                        <a
                          key={getResourceKey(resource, resourceIndex)}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {resource.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Input */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Track Your Scores</h3>
            
            {selectedExam.examType === 'gre' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantitative</label>
                  <input
                    type="number"
                    min="130"
                    max="170"
                    value={scores.gre.quant}
                    onChange={(e) => handleScoreChange('gre', 'quant', parseInt(e.target.value) || 0)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verbal</label>
                  <input
                    type="number"
                    min="130"
                    max="170"
                    value={scores.gre.verbal}
                    onChange={(e) => handleScoreChange('gre', 'verbal', parseInt(e.target.value) || 0)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">AWA</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    step="0.5"
                    value={scores.gre.awa}
                    onChange={(e) => handleScoreChange('gre', 'awa', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total</label>
                  <input
                    type="number"
                    min="260"
                    max="340"
                    value={scores.gre.quant + scores.gre.verbal}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                  />
                </div>
              </div>
            )}

            {selectedExam.examType === 'ielts' && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(['overall', 'listening', 'reading', 'writing', 'speaking'] as const).map((section) => (
                  <div key={section}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {section}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="9"
                      step="0.5"
                      value={scores.ielts[section]}
                      onChange={(e) => handleScoreChange('ielts', section, parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                ))}
              </div>
            )}

            {selectedExam.examType === 'toefl' && (
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700">Total Score</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={scores.toefl.total}
                  onChange={(e) => handleScoreChange('toefl', 'total', parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            )}

            <button
              onClick={() => handleSaveScores(selectedExam.examType)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Scores
            </button>
          </div>

          {/* Test Centers & Registration */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Test Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Test Centers</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {selectedExam.testCenters.map((center, index) => (
                    <li key={`center-${index}`}>{center}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Registration</h4>
                <a
                  href={selectedExam.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Register for {selectedExam.examType.toUpperCase()}
                </a>
                <p className="text-sm text-gray-600 mt-2">
                  Click above to visit the official registration page
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Scores */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Score Targets</h3>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-900">Minimum Required</h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {selectedExam.recommendedScore.minimum}
                  </p>
                  <p className="text-sm text-blue-600">Basic eligibility</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">Competitive Score</h4>
                  <p className="text-2xl font-bold text-green-700">
                    {selectedExam.recommendedScore.competitive}+
                  </p>
                  <p className="text-sm text-green-600">For top universities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Exam Selected State */}
      {!selectedExam && exams.length > 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select an Exam to Get Started</h3>
          <p className="text-gray-600">
            Choose from {exams.length} available exams to view study plans and track your progress
          </p>
        </div>
      )}

      {/* No Exams Available State */}
      {exams.length === 0 && (
        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Exam Data Available</h3>
          <p className="text-yellow-700">
            Exam preparation content is currently being updated. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
}