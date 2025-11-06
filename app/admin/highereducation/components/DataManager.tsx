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

  const handleSave = async () => {
    try {
      if (activeTab === 'countries') {
        await updateCountriesData(data.countries);
      } else if (activeTab === 'examPreparations') {
        await updateExamPreparations(data.examPreparations);
      } else {
        await updateApplicationDocuments(data.applicationDocuments);
      }
      alert('Data saved successfully!');
    } catch (error) {
      alert('Failed to save data');
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
        return 'Countries';
      case 'examPreparations':
        return 'Exams';
      case 'applicationDocuments':
        return 'Documents';
      default:
        return tab;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex space-x-4 mb-6">
        {(['countries', 'examPreparations', 'applicationDocuments'] as DataTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md ${
              activeTab === tab 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {getTabDisplayName(tab)}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <textarea
          value={JSON.stringify(getCurrentData(), null, 2)}
          onChange={(e) => {
            try {
              updateCurrentData(JSON.parse(e.target.value));
            } catch (error) {
              console.error('Invalid JSON');
            }
          }}
          rows={20}
          className="w-full border border-gray-300 rounded-md p-4 font-mono text-sm"
        />
      </div>

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
      >
        Save Changes
      </button>
    </div>
  );
}