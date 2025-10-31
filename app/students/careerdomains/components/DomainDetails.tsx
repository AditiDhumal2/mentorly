'use client';

import { useState } from 'react';
import { ICareerDomain } from '@/types/careerDomains';

interface DomainDetailsProps {
  domain: ICareerDomain;
}

const tabs = [
  'Overview',
  'Key Skills',
  'Tools and Technologies',
  'Project Ideas',
  'Salary Insights',
  'Learning Resources'
] as const;

type TabType = typeof tabs[number];

export default function DomainDetails({ domain }: DomainDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Domain Overview</h3>
              <p className="text-gray-600 leading-relaxed">{domain.description}</p>
            </div>
            
            {domain.roles && domain.roles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Roles</h3>
                <div className="flex flex-wrap gap-3">
                  {domain.roles.map((role, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'Key Skills':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Essential Skills</h3>
            <div className="flex flex-wrap gap-2">
              {domain.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );

      case 'Tools and Technologies':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tools & Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {domain.tools?.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        );

      case 'Project Ideas':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Ideas</h3>
            <div className="space-y-3">
              {domain.projects?.map((project, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">{project}</h4>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Salary Insights':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Salary Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-2">India</h4>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {domain.averageSalary?.india || 'Not available'}
                </div>
                <p className="text-green-700 text-sm">Average annual salary</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">International</h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {domain.averageSalary?.abroad || 'Not available'}
                </div>
                <p className="text-blue-700 text-sm">Average annual salary</p>
              </div>
            </div>
          </div>
        );

      case 'Learning Resources':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Resources</h3>
            <div className="space-y-3">
              {domain.resources?.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                    {resource.type && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {resource.type}
                      </span>
                    )}
                  </div>
                  {/* Resource URL preview */}
                  <p className="text-gray-500 text-sm mt-2 truncate">
                    {resource.url.replace(/^https?:\/\//, '')}
                  </p>
                </a>
              ))}
              {(!domain.resources || domain.resources.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No learning resources available for this domain yet.
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Domain Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {domain.name}
            </h1>
            <p className="text-gray-600 leading-relaxed">
              {domain.description}
            </p>
          </div>
          <div className="ml-6 w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            {domain.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}