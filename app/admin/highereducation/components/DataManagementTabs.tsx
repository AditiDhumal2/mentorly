// app/admin/highereducation/components/DataManagementTabs.tsx
'use client';

import { useState } from 'react';
import CountriesManager from './CountriesManager';
import ExamsManager from './ExamsManager';
import DocumentsManager from './DocumentsManager';
import { Country, ExamPreparation, ApplicationDocument } from '@/types/higher-education';

interface DataManagementTabsProps {
  countries: Country[];
  exams: ExamPreparation[];
  documents: ApplicationDocument[];
}

type TabType = 'countries' | 'exams' | 'documents';

export default function DataManagementTabs({ countries, exams, documents }: DataManagementTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('countries');

  const tabs = [
    { id: 'countries' as TabType, name: 'Countries & Universities', icon: '🌍' },
    { id: 'exams' as TabType, name: 'Exam Preparations', icon: '📝' },
    { id: 'documents' as TabType, name: 'Application Documents', icon: '📄' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'countries':
        return <CountriesManager countries={countries} />;
      case 'exams':
        return <ExamsManager exams={exams} />;
      case 'documents':
        return <DocumentsManager documents={documents} />;
      default:
        return <CountriesManager countries={countries} />;
    }
  };

  return (
    <div>
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              type="button"
            >
              <span className="mr-2 text-base">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {renderActiveTab()}
      </div>
    </div>
  );
}