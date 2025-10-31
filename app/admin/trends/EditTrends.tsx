"use client";

import { useState } from 'react';
import { MarketTrendsData, TrendingSkill, HiringDomain, SalaryComparison, HotArticle } from '@/lib/trends-types';
import { 
  updateTrendsData, 
  addTrendingSkill, 
  addHiringDomain, 
  addSalaryComparison, 
  addHotArticle, 
  deleteTrendingSkill, 
  deleteHiringDomain, 
  deleteSalaryComparison, 
  deleteHotArticle,
  updateTrendingSkill,
  updateHiringDomain,
  updateSalaryComparison,
  updateHotArticle
} from './trendsaction';

interface EditTrendsProps {
  initialData: MarketTrendsData;
}

type EditingItem = {
  id: string;
  type: 'skill' | 'domain' | 'salary' | 'article';
  data: any;
};

export default function EditTrends({ initialData }: EditTrendsProps) {
  const [trendsData, setTrendsData] = useState<MarketTrendsData>(initialData);
  const [newSkill, setNewSkill] = useState({ skill: '', demandScore: 80 });
  const [newDomain, setNewDomain] = useState({ domain: '', openings: 1000 });
  const [newSalary, setNewSalary] = useState({ role: '', india: 10, abroad: 100 });
  const [newArticle, setNewArticle] = useState({ title: '', summary: '', url: '' });
  const [activeTab, setActiveTab] = useState('skills');
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleUpdateTrends = async (updates: Partial<MarketTrendsData>) => {
    setSaveStatus('saving');
    const updatedData: MarketTrendsData = {
      ...trendsData,
      ...updates
    };
    const result = await updateTrendsData(updatedData);
    if (result.success && result.data) {
      setTrendsData(result.data);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Trending Skills Functions
  const handleAddSkill = async () => {
    if (newSkill.skill && newSkill.demandScore > 0) {
      const result = await addTrendingSkill(newSkill);
      if (result.success && result.data) {
        setTrendsData(result.data);
        setNewSkill({ skill: '', demandScore: 80 });
      }
    }
  };

  const handleUpdateSkill = async (id: string, updates: Partial<TrendingSkill>) => {
    const result = await updateTrendingSkill(id, updates);
    if (result.success && result.data) {
      setTrendsData(result.data);
      setEditingItem(null);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    const result = await deleteTrendingSkill(id);
    if (result.success && result.data) {
      setTrendsData(result.data);
    }
  };

  // Hiring Domains Functions
  const handleAddDomain = async () => {
    if (newDomain.domain && newDomain.openings > 0) {
      const result = await addHiringDomain(newDomain);
      if (result.success && result.data) {
        setTrendsData(result.data);
        setNewDomain({ domain: '', openings: 1000 });
      }
    }
  };

  const handleUpdateDomain = async (id: string, updates: Partial<HiringDomain>) => {
    const result = await updateHiringDomain(id, updates);
    if (result.success && result.data) {
      setTrendsData(result.data);
      setEditingItem(null);
    }
  };

  const handleDeleteDomain = async (id: string) => {
    const result = await deleteHiringDomain(id);
    if (result.success && result.data) {
      setTrendsData(result.data);
    }
  };

  // Salary Comparison Functions
  const handleAddSalary = async () => {
    if (newSalary.role && newSalary.india > 0 && newSalary.abroad > 0) {
      const result = await addSalaryComparison(newSalary);
      if (result.success && result.data) {
        setTrendsData(result.data);
        setNewSalary({ role: '', india: 10, abroad: 100 });
      }
    }
  };

  const handleUpdateSalary = async (id: string, updates: Partial<SalaryComparison>) => {
    const result = await updateSalaryComparison(id, updates);
    if (result.success && result.data) {
      setTrendsData(result.data);
      setEditingItem(null);
    }
  };

  const handleDeleteSalary = async (id: string) => {
    const result = await deleteSalaryComparison(id);
    if (result.success && result.data) {
      setTrendsData(result.data);
    }
  };

  // Hot Articles Functions
  const handleAddArticle = async () => {
    if (newArticle.title && newArticle.url) {
      const result = await addHotArticle(newArticle);
      if (result.success && result.data) {
        setTrendsData(result.data);
        setNewArticle({ title: '', summary: '', url: '' });
      }
    }
  };

  const handleUpdateArticle = async (id: string, updates: Partial<HotArticle>) => {
    const result = await updateHotArticle(id, updates);
    if (result.success && result.data) {
      setTrendsData(result.data);
      setEditingItem(null);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    const result = await deleteHotArticle(id);
    if (result.success && result.data) {
      setTrendsData(result.data);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'skills', name: 'Skills', icon: '📈' },
    { id: 'domains', name: 'Domains', icon: '💼' },
    { id: 'salaries', name: 'Salaries', icon: '💰' },
    { id: 'articles', name: 'Articles', icon: '🔥' },
  ];

  return (
    <div className="bg-white backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Save Status Indicator */}
      {saveStatus !== 'idle' && (
        <div className={`mb-4 p-3 rounded-lg border ${
          saveStatus === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : saveStatus === 'saving'
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {saveStatus === 'success' ? '✓ Changes saved successfully!' : 
           saveStatus === 'saving' ? '💾 Saving changes...' : '✗ Failed to save changes'}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 p-1 bg-gray-100 rounded-lg border border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white border border-purple-500'
                : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month Display
              </label>
              <input
                type="text"
                value={trendsData.month}
                onChange={(e) => handleUpdateTrends({ month: e.target.value })}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="e.g., December 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Source
              </label>
              <input
                type="text"
                value={trendsData.apiSource}
                onChange={(e) => handleUpdateTrends({ apiSource: e.target.value })}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="e.g., LinkedIn Jobs API"
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              Last updated: {new Date(trendsData.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )}

      {/* Trending Skills Management */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Skills Management</h3>
          
          {/* Add New Skill */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Add New Skill</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Skill name"
                value={newSkill.skill}
                onChange={(e) => setNewSkill({ ...newSkill, skill: e.target.value })}
                className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <input
                type="number"
                placeholder="Demand score"
                value={newSkill.demandScore}
                onChange={(e) => setNewSkill({ ...newSkill, demandScore: parseInt(e.target.value) || 0 })}
                className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                min="0"
                max="100"
              />
              <button
                onClick={handleAddSkill}
                disabled={!newSkill.skill.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Skills List */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Current Skills ({trendsData.trendingSkills.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trendsData.trendingSkills
                .sort((a, b) => b.demandScore - a.demandScore)
                .map((skill, index) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    {editingItem?.id === skill.id && editingItem?.type === 'skill' ? (
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingItem.data.skill}
                          onChange={(e) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, skill: e.target.value }
                          }))}
                          className="p-2 bg-white border border-gray-300 rounded text-gray-900"
                        />
                        <input
                          type="number"
                          value={editingItem.data.demandScore}
                          onChange={(e) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, demandScore: parseInt(e.target.value) || 0 }
                          }))}
                          className="p-2 bg-white border border-gray-300 rounded text-gray-900"
                          min="0"
                          max="100"
                        />
                        <div className="col-span-2 flex space-x-2">
                          <button
                            onClick={() => handleUpdateSkill(skill.id, editingItem.data)}
                            className="flex-1 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="flex-1 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                            index === 1 ? 'bg-gray-100 text-gray-700 border-gray-300' :
                            index === 2 ? 'bg-orange-100 text-orange-700 border-orange-300' :
                            'bg-green-100 text-green-700 border-green-300'
                          }`}>
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{skill.skill}</span>
                            <span className="text-green-600 ml-3 font-bold">{skill.demandScore}%</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingItem({ id: skill.id, type: 'skill', data: { ...skill } })}
                            className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Hiring Domains Management */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Hiring Domains Management</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Add New Domain</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Domain name"
                value={newDomain.domain}
                onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
                className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <input
                type="number"
                placeholder="Job openings"
                value={newDomain.openings}
                onChange={(e) => setNewDomain({ ...newDomain, openings: parseInt(e.target.value) || 0 })}
                className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={handleAddDomain}
                disabled={!newDomain.domain.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Add Domain
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Current Domains ({trendsData.hiringDomains.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trendsData.hiringDomains
                .sort((a, b) => b.openings - a.openings)
                .map((domain, index) => (
                  <div key={domain.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    {editingItem?.id === domain.id && editingItem?.type === 'domain' ? (
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingItem.data.domain}
                          onChange={(e) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, domain: e.target.value }
                          }))}
                          className="p-2 bg-white border border-gray-300 rounded text-gray-900"
                        />
                        <input
                          type="number"
                          value={editingItem.data.openings}
                          onChange={(e) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, openings: parseInt(e.target.value) || 0 }
                          }))}
                          className="p-2 bg-white border border-gray-300 rounded text-gray-900"
                        />
                        <div className="col-span-2 flex space-x-2">
                          <button
                            onClick={() => handleUpdateDomain(domain.id, editingItem.data)}
                            className="flex-1 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="flex-1 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                            index === 0 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                            index === 1 ? 'bg-purple-100 text-purple-700 border-purple-300' :
                            index === 2 ? 'bg-cyan-100 text-cyan-700 border-cyan-300' :
                            'bg-indigo-100 text-indigo-700 border-indigo-300'
                          }`}>
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{domain.domain}</span>
                            <span className="text-blue-600 ml-3 font-bold">{domain.openings.toLocaleString()} openings</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingItem({ id: domain.id, type: 'domain', data: { ...domain } })}
                            className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDomain(domain.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Salary Comparison Management */}
      {activeTab === 'salaries' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Salary Comparison Management</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Add Salary Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Job role"
                value={newSalary.role}
                onChange={(e) => setNewSalary({ ...newSalary, role: e.target.value })}
                className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <input
                type="number"
                placeholder="India (LPA)"
                value={newSalary.india}
                onChange={(e) => setNewSalary({ ...newSalary, india: parseInt(e.target.value) || 0 })}
                className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <input
                type="number"
                placeholder="Abroad (k USD)"
                value={newSalary.abroad}
                onChange={(e) => setNewSalary({ ...newSalary, abroad: parseInt(e.target.value) || 0 })}
                className="p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={handleAddSalary}
                disabled={!newSalary.role.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Add Salary
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Current Salary Comparisons ({trendsData.salaryComparison.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trendsData.salaryComparison.map((salary) => (
                <div key={salary.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  {editingItem?.id === salary.id && editingItem?.type === 'salary' ? (
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={editingItem.data.role}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, role: e.target.value }
                        }))}
                        className="p-2 bg-white border border-gray-300 rounded text-gray-900"
                        placeholder="Role"
                      />
                      <input
                        type="number"
                        value={editingItem.data.india}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, india: parseInt(e.target.value) || 0 }
                        }))}
                        className="p-2 bg-white border border-gray-300 rounded text-gray-900"
                        placeholder="India LPA"
                      />
                      <input
                        type="number"
                        value={editingItem.data.abroad}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, abroad: parseInt(e.target.value) || 0 }
                        }))}
                        className="p-2 bg-white border border-gray-300 rounded text-gray-900"
                        placeholder="Abroad k USD"
                      />
                      <div className="col-span-3 flex space-x-2">
                        <button
                          onClick={() => handleUpdateSalary(salary.id, editingItem.data)}
                          className="flex-1 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="flex-1 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{salary.role}</span>
                        <div className="flex space-x-4 mt-1">
                          <span className="text-cyan-600 text-sm">₹{salary.india}L (India)</span>
                          <span className="text-green-600 text-sm">${salary.abroad}k (Abroad)</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingItem({ id: salary.id, type: 'salary', data: { ...salary } })}
                          className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSalary(salary.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hot Articles Management */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Hot Articles Management</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Add New Article</h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Article title"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <textarea
                placeholder="Article summary"
                value={newArticle.summary}
                onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                rows={3}
              />
              <input
                type="url"
                placeholder="Article URL"
                value={newArticle.url}
                onChange={(e) => setNewArticle({ ...newArticle, url: e.target.value })}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={handleAddArticle}
                disabled={!newArticle.title.trim() || !newArticle.summary.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Add Article
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              Current Articles ({trendsData.hotArticles.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trendsData.hotArticles.map((article) => (
                <div key={article.id} className="p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  {editingItem?.id === article.id && editingItem?.type === 'article' ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingItem.data.title}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, title: e.target.value }
                        }))}
                        className="w-full p-2 bg-white border border-gray-300 rounded text-gray-900"
                        placeholder="Title"
                      />
                      <textarea
                        value={editingItem.data.summary}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, summary: e.target.value }
                        }))}
                        rows={3}
                        className="w-full p-2 bg-white border border-gray-300 rounded text-gray-900"
                        placeholder="Summary"
                      />
                      <input
                        type="url"
                        value={editingItem.data.url}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, url: e.target.value }
                        }))}
                        className="w-full p-2 bg-white border border-gray-300 rounded text-gray-900"
                        placeholder="URL"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateArticle(article.id, editingItem.data)}
                          className="flex-1 bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="flex-1 bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">{article.title}</h5>
                        <p className="text-purple-700 text-sm mb-2 line-clamp-2">{article.summary}</p>
                        <a href={article.url} className="text-purple-600 text-xs hover:text-purple-800">
                          {article.url}
                        </a>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setEditingItem({ id: article.id, type: 'article', data: { ...article } })}
                          className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}