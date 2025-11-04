// app/admin/placementhub/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { getPlacementHubDataForAdmin, initializePlacementHubData, updateMockInterviewPortal } from '@/actions/placementhub-admin-actions';
import { SkillsManager } from './components/SkillsManager';
import { ResumeTemplatesManager } from './components/ResumeTemplatesManager';
import { CodingProblemsManager } from './components/CodingProblemsManager';

interface PlacementData {
  _id: string;
  mustHaveSkills: string[];
  goodToHaveSkills: string[];
  toolsAndPractice: {
    mockInterviewPortal: string;
    resumeTemplates: Array<{
      title: string;
      url: string;
      type: 'pdf' | 'doc' | 'external';
      source: string;
      description: string;
    }>;
    topCodingProblems: Array<{
      title: string;
      platform: string;
      url: string;
    }>;
    contestCalendar: Array<{
      name: string;
      date: string; // Changed to string for serialization
      platform: string;
    }>;
  };
  interviewTips: Array<{
    title: string;
    description: string;
  }>;
  updatedAt: string; // Changed to string for serialization
}

// Helper function to safely serialize data
function serializePlacementData(data: any): PlacementData | null {
  if (!data) return null;

  try {
    return {
      _id: String(data._id || 'unknown'),
      mustHaveSkills: Array.isArray(data.mustHaveSkills) ? data.mustHaveSkills : [],
      goodToHaveSkills: Array.isArray(data.goodToHaveSkills) ? data.goodToHaveSkills : [],
      toolsAndPractice: {
        mockInterviewPortal: String(data.toolsAndPractice?.mockInterviewPortal || ''),
        resumeTemplates: (data.toolsAndPractice?.resumeTemplates || []).map((template: any) => ({
          title: String(template.title || ''),
          url: String(template.url || ''),
          type: template.type as 'pdf' | 'doc' | 'external',
          source: String(template.source || ''),
          description: String(template.description || '')
        })),
        topCodingProblems: (data.toolsAndPractice?.topCodingProblems || []).map((problem: any) => ({
          title: String(problem.title || ''),
          platform: String(problem.platform || ''),
          url: String(problem.url || '')
        })),
        contestCalendar: (data.toolsAndPractice?.contestCalendar || []).map((contest: any) => ({
          name: String(contest.name || ''),
          date: contest.date instanceof Date ? contest.date.toISOString() : String(contest.date || ''),
          platform: String(contest.platform || '')
        }))
      },
      interviewTips: (data.interviewTips || []).map((tip: any) => ({
        title: String(tip.title || ''),
        description: String(tip.description || '')
      })),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : String(data.updatedAt || '')
    };
  } catch (error) {
    console.error('Error serializing placement data:', error);
    return null;
  }
}

export default function AdminPlacementHub() {
  const [placementData, setPlacementData] = useState<PlacementData | null>(null);
  const [activeTab, setActiveTab] = useState('skills');
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [mockInterviewUrl, setMockInterviewUrl] = useState('');
  const [urlMessage, setUrlMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getPlacementHubDataForAdmin();
      const serializedData = serializePlacementData(data);
      setPlacementData(serializedData);
      if (serializedData?.toolsAndPractice?.mockInterviewPortal) {
        setMockInterviewUrl(serializedData.toolsAndPractice.mockInterviewPortal);
      }
    } catch (error) {
      console.error('Failed to load placement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeData = async () => {
    setInitializing(true);
    try {
      const result = await initializePlacementHubData();
      await loadData();
      alert(result.message);
    } catch (error) {
      alert('Failed to initialize data: ' + (error as Error).message);
    } finally {
      setInitializing(false);
    }
  };

  const handleUpdateMockInterviewUrl = async () => {
    try {
      const result = await updateMockInterviewPortal(mockInterviewUrl);
      setUrlMessage(result.message);
      setTimeout(() => setUrlMessage(''), 3000);
    } catch (error) {
      setUrlMessage('Error updating URL: ' + (error as Error).message);
    }
  };

  const tabs = [
    { id: 'skills', name: 'Skills', icon: '💡' },
    { id: 'resumes', name: 'Resume Templates', icon: '📄' },
    { id: 'problems', name: 'Coding Problems', icon: '💻' },
    { id: 'interview', name: 'Mock Interview', icon: '🎯' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin panel...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Placement Data Found</h1>
            <p className="text-gray-600 mb-6">You need to initialize the placement hub data first.</p>
            <button
              onClick={handleInitializeData}
              disabled={initializing}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {initializing ? 'Initializing...' : 'Initialize Placement Hub Data'}
            </button>
            <p className="mt-4 text-sm text-gray-500">
              This will create default placement data with resume templates, coding problems, and interview tips.
            </p>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Placement Hub Admin</h1>
              <p className="mt-2 text-gray-600">
                Manage all placement preparation resources and content
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(placementData.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'skills' && (
            <SkillsManager
              initialMustHaveSkills={placementData.mustHaveSkills || []}
              initialGoodToHaveSkills={placementData.goodToHaveSkills || []}
            />
          )}

          {activeTab === 'resumes' && (
            <ResumeTemplatesManager
              initialTemplates={placementData.toolsAndPractice?.resumeTemplates || []}
            />
          )}

          {activeTab === 'problems' && (
            <CodingProblemsManager
              initialProblems={placementData.toolsAndPractice?.topCodingProblems || []}
            />
          )}

          {activeTab === 'interview' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mock Interview Portal</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mock Interview Portal URL
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      value={mockInterviewUrl}
                      onChange={(e) => setMockInterviewUrl(e.target.value)}
                      placeholder="https://pramp.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleUpdateMockInterviewUrl}
                      className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Update URL
                    </button>
                  </div>
                  {urlMessage && (
                    <div className={`mt-2 p-2 rounded-md text-sm ${
                      urlMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {urlMessage}
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Recommended Platforms</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <a href="https://pramp.com" target="_blank" rel="noopener noreferrer" className="underline">Pramp</a> - Free peer-to-peer mock interviews</li>
                    <li>• <a href="https://interviewing.io" target="_blank" rel="noopener noreferrer" className="underline">Interviewing.io</a> - Anonymous technical mock interviews</li>
                    <li>• <a href="https://leetcode.com/interview" target="_blank" rel="noopener noreferrer" className="underline">LeetCode Interview</a> - Mock interviews with FAANG engineers</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-blue-600">{placementData.mustHaveSkills?.length || 0}</div>
            <div className="text-sm text-gray-600">Must-Have Skills</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-green-600">{placementData.goodToHaveSkills?.length || 0}</div>
            <div className="text-sm text-gray-600">Good-to-Have Skills</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-purple-600">{placementData.toolsAndPractice?.resumeTemplates?.length || 0}</div>
            <div className="text-sm text-gray-600">Resume Templates</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-orange-600">{placementData.toolsAndPractice?.topCodingProblems?.length || 0}</div>
            <div className="text-sm text-gray-600">Coding Problems</div>
          </div>
        </div>
      </div>
    </div>
  );
}