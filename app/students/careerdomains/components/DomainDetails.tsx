// app/students/careerdomains/components/DomainDetails.tsx
'use client';

import { useState } from 'react';
import { ICareerDomain } from '@/types/careerDomains';
import SkillTag from './SkillTag';
import ProjectList from './ProjectList';
import SalaryTable from './SalaryTable';
import ResourceLink from './ResourceLink';

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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Domain Overview</h3>
              <p className="text-gray-700 leading-relaxed text-lg">{domain.description}</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Roles</h3>
              <div className="flex flex-wrap gap-3">
                {domain.roles.map((role, index) => (
                  <span 
                    key={index} 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Key Skills':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Essential Skills</h3>
            <SkillTag skills={domain.skills} />
          </div>
        );

      case 'Tools and Technologies':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tools & Technologies</h3>
            <SkillTag skills={domain.tools} />
          </div>
        );

      case 'Project Ideas':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Ideas</h3>
            <ProjectList projects={domain.projects} />
          </div>
        );

      case 'Salary Insights':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Salary Insights</h3>
            <SalaryTable salary={domain.averageSalary} roles={domain.roles} />
          </div>
        );

      case 'Learning Resources':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Resources</h3>
            <ResourceLink resources={domain.resources} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50 mb-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {domain.name}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-4xl">
              {domain.description}
            </p>
          </div>
          <div className="ml-6 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {domain.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-blue-200/50">
        <div className="border-b border-gray-200/50">
          <nav className="flex overflow-x-auto px-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
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