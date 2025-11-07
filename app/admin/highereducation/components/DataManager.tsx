// app/admin/highereducation/components/DataManager.tsx
'use client';

import { useState } from 'react';
import { updateCountriesData, updateExamPreparations, updateApplicationDocuments } from '@/actions/highereducation-admin-actions';

interface DataManagerProps {
  initialData: {
    countries: any[];
    examPreparations: any[];
    applicationDocuments: any[];
  };
}

type DataTab = 'countries' | 'examPreparations' | 'applicationDocuments';

export default function DataManager({ initialData }: DataManagerProps) {
  const [activeTab, setActiveTab] = useState<DataTab>('countries');
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      if (activeTab === 'countries') {
        await updateCountriesData(data.countries);
      } else if (activeTab === 'examPreparations') {
        await updateExamPreparations(data.examPreparations);
      } else {
        await updateApplicationDocuments(data.applicationDocuments);
      }
      
      setMessage({ type: 'success', text: 'Data saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save data. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentData = () => {
    return data[activeTab];
  };

  const updateCurrentData = (newData: any) => {
    setData({
      ...data,
      [activeTab]: newData
    });
  };

  const getTabDisplayName = (tab: DataTab) => {
    switch (tab) {
      case 'countries':
        return 'Countries & Universities';
      case 'examPreparations':
        return 'Exam Preparations';
      case 'applicationDocuments':
        return 'Application Documents';
      default:
        return tab;
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newData = JSON.parse(e.target.value);
      updateCurrentData(newData);
    } catch (error) {
      console.error('Invalid JSON');
    }
  };

  const handleAddNewItem = () => {
    const currentData = getCurrentData();
    let newItem = {};

    if (activeTab === 'countries') {
      newItem = {
        name: 'New Country',
        code: 'XX',
        flag: '🏳️',
        topInstitutes: [],
        visaRequirements: [],
        costOfLiving: {
          monthly: 'Not specified',
          yearly: 'Not specified'
        },
        taRaGuide: {
          eligibility: [],
          requirements: [],
          applicationProcess: [],
          tips: [],
          documentsRequired: [],
          averageStipend: 'Not specified'
        },
        popularity: 'medium'
      };
    } else if (activeTab === 'examPreparations') {
      newItem = {
        examType: 'gre',
        studyPlan: [],
        recommendedScore: {
          minimum: 0,
          competitive: 0
        },
        testCenters: [],
        registrationLink: ''
      };
    } else {
      newItem = {
        type: 'sop',
        title: 'New Document',
        guidelines: [],
        templates: [],
        examples: [],
        commonMistakes: []
      };
    }

    updateCurrentData([...currentData, newItem]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Data Management</h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage {getTabDisplayName(activeTab).toLowerCase()} data
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddNewItem}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Add New
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 px-6">
          {(['countries', 'examPreparations', 'applicationDocuments'] as DataTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getTabDisplayName(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mt-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* JSON Editor */}
      <div className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON Data Editor ({getCurrentData().length} items)
          </label>
          <textarea
            value={JSON.stringify(getCurrentData(), null, 2)}
            onChange={handleJsonChange}
            rows={20}
            className="w-full border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Edit JSON data here..."
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-yellow-600 text-lg mr-2">💡</span>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Editing Tips</h4>
              <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                <li>• Use valid JSON format with proper quotes and commas</li>
                <li>• Make sure all required fields are present</li>
                <li>• Use "Add New" button to create empty templates</li>
                <li>• Changes are saved to the database immediately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}