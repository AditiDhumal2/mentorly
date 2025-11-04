// app/students/placementhub/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { getPlacementHubData } from '@/actions/placementhub-students-actions';
import { PlacementHubData } from '@/types/placementhub';
import { SkillList } from './components/SkillList';
import { DSAProblemTable } from './components/DSAProblemTable';
import { ResumeTemplateCard } from './components/ResumeTemplateCard';
import { ContestCalendarCard } from './components/ContestCalendarCard';
import { MockInterviewCard } from './components/MockInterviewCard';

// Helper function to safely serialize data for client components
function serializePlacementData(data: PlacementHubData): PlacementHubData {
  return {
    ...data,
    toolsAndPractice: {
      ...data.toolsAndPractice,
      resumeTemplates: data.toolsAndPractice.resumeTemplates.map(template => ({
        ...template
      })),
      topCodingProblems: data.toolsAndPractice.topCodingProblems.map(problem => ({
        ...problem
      })),
      contestCalendar: data.toolsAndPractice.contestCalendar.map(contest => ({
        ...contest,
        date: contest.date instanceof Date ? contest.date : new Date(contest.date)
      }))
    },
    interviewTips: data.interviewTips.map(tip => ({
      ...tip
    }))
  };
}

export default function StudentPlacementHub() {
  const [placementData, setPlacementData] = useState<PlacementHubData | null>(null);
  const [activeTab, setActiveTab] = useState('must-have-skills');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPlacementHubData();
        // Serialize the data to ensure it's safe for client components
        const serializedData = serializePlacementData(data);
        setPlacementData(serializedData);
      } catch (error) {
        console.error('Failed to load placement data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const tabs = [
    { id: 'must-have-skills', name: 'Must-Have Skills' },
    { id: 'good-to-have-skills', name: 'Good-to-Have Skills' },
    { id: 'mock-interview', name: 'Mock Interview' },
    { id: 'resume-templates', name: 'Resume Templates' },
    { id: 'dsa-problems', name: 'Top DSA Problems' },
    { id: 'contest-calendar', name: 'Contest Calendar' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading placement hub...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!placementData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">No Placement Data Available</h1>
            <p className="mt-2 text-gray-600">Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Placement Preparation Hub</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive resources to prepare for internships and placements
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'must-have-skills' && (
            <SkillList
              skills={placementData.mustHaveSkills}
              title="Must-Have Skills for Placements"
            />
          )}

          {activeTab === 'good-to-have-skills' && (
            <SkillList
              skills={placementData.goodToHaveSkills}
              title="Good-to-Have Skills (Additional Advantage)"
            />
          )}

          {activeTab === 'mock-interview' && (
            <MockInterviewCard portalUrl={placementData.toolsAndPractice.mockInterviewPortal} />
          )}

          {activeTab === 'resume-templates' && (
            <ResumeTemplateCard templates={placementData.toolsAndPractice.resumeTemplates} />
          )}

          {activeTab === 'dsa-problems' && (
            <DSAProblemTable problems={placementData.toolsAndPractice.topCodingProblems} />
          )}

          {activeTab === 'contest-calendar' && (
            <ContestCalendarCard contests={placementData.toolsAndPractice.contestCalendar} />
          )}
        </div>

        {/* Interview Tips Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Interview Preparation Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {placementData.interviewTips.map((tip, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}