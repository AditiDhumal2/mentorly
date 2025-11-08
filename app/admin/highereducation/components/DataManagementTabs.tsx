'use client';

import { useState } from 'react';
import CountriesManager from './CountriesManager';
import ExamsManager from './ExamsManager';
import DocumentsManager from './DocumentsManager';
import TA_RAManager from './TA_RAManager';
import { HigherEducationData, TA_RAGuideItem } from '@/types/higher-education';

interface DataManagementTabsProps {
  data?: HigherEducationData & {
    taRaGuides?: TA_RAGuideItem[];
  };
}

const tabs = [
  { id: 'countries', label: 'Countries', icon: '🌍' },
  { id: 'exams', label: 'Exams', icon: '📝' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'ta-ra', label: 'TA/RA Guides', icon: '👨‍🏫' },
] as const;

export default function DataManagementTabs({ data }: DataManagementTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('countries');

  // Safe data access with proper fallbacks
  const safeData = {
    countries: Array.isArray(data?.countries) ? data.countries : [],
    examPreparations: Array.isArray(data?.examPreparations) ? data.examPreparations : [],
    applicationDocuments: Array.isArray(data?.applicationDocuments) ? data.applicationDocuments : [],
    studentProgress: Array.isArray(data?.studentProgress) ? data.studentProgress : [],
    taRaGuides: Array.isArray(data?.taRaGuides) ? data.taRaGuides : []
  };

  console.log('📊 DataManagementTabs data:', {
    countries: safeData.countries.length,
    exams: safeData.examPreparations.length,
    documents: safeData.applicationDocuments.length,
    taRaGuides: safeData.taRaGuides.length
  });

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'countries':
        return <CountriesManager countries={safeData.countries} />;
      case 'exams':
        return <ExamsManager exams={safeData.examPreparations} />;
      case 'documents':
        return <DocumentsManager documents={safeData.applicationDocuments} />;
      case 'ta-ra':
        return <TA_RAManager taRaGuides={safeData.taRaGuides} />;
      default:
        return <CountriesManager countries={safeData.countries} />;
    }
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                transition-all duration-200
              `}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.label}
              <span className="ml-2 py-0.5 px-2 text-xs bg-blue-100 text-blue-600 rounded-full">
                {getTabCount(tab.id, safeData)}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderActiveTab()}
      </div>
    </div>
  );
}

// Helper function to get count for each tab
function getTabCount(tabId: string, data: any): string {
  switch (tabId) {
    case 'countries':
      return (data.countries?.length || 0).toString();
    case 'exams':
      return (data.examPreparations?.length || 0).toString();
    case 'documents':
      return (data.applicationDocuments?.length || 0).toString();
    case 'ta-ra':
      return (data.taRaGuides?.length || 0).toString();
    default:
      return '0';
  }
}