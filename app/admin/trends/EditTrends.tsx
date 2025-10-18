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
    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
      {/* Save Status Indicator */}
      {saveStatus !== 'idle' && (
        <div className={`mb-4 p-3 rounded-lg border ${
          saveStatus === 'success' 
            ? 'bg-green-900/20 border-green-700/30 text-green-400' 
            : saveStatus === 'saving'
            ? 'bg-blue-900/20 border-blue-700/30 text-blue-400'
            : 'bg-red-900/20 border-red-700/30 text-red-400'
        }`}>
          {saveStatus === 'success' ? '✓ Changes saved successfully!' : 
           saveStatus === 'saving' ? '💾 Saving changes...' : '✗ Failed to save changes'}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 p-1 bg-gray-700/50 rounded-lg border border-gray-600/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
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
          <h3 className="text-lg font-bold text-white mb-4">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Month Display
              </label>
              <input
                type="text"
                value={trendsData.month}
                onChange={(e) => handleUpdateTrends({ month: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="e.g., December 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Source
              </label>
              <input
                type="text"
                value={trendsData.apiSource}
                onChange={(e) => handleUpdateTrends({ apiSource: e.target.value })}
                className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="e.g., LinkedIn Jobs API"
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <p className="text-sm text-gray-400">
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
          <h3 className="text-lg font-bold text-white mb-4">Trending Skills Management</h3>
          
          {/* Add New Skill */}
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
            <h4 className="text-md font-semibold text-white mb-3">Add New Skill</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Skill name"
                value={newSkill.skill}
                onChange={(e) => setNewSkill({ ...newSkill, skill: e.target.value })}
                className="p-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:ring-1 focus:ring-green-400"
              />
              <input
                type="number"
                placeholder="Demand score"
                value={newSkill.demandScore}
                onChange={(e) => setNewSkill({ ...newSkill, demandScore: parseInt(e.target.value) || 0 })}
                className="p-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                min="0"
                max="100"
              />
              <button
                onClick={handleAddSkill}
                disabled={!newSkill.skill.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Skills List */}
          <div>
            <h4 className="text-md font-semibold text-white mb-3">
              Current Skills ({trendsData.trendingSkills.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trendsData.trendingSkills
                .sort((a, b) => b.demandScore - a.demandScore)
                .map((skill, index) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 hover:bg-gray-700/50 transition-colors">
                    {editingItem?.id === skill.id && editingItem?.type === 'skill' ? (
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingItem.data.skill}
                          onChange={(e) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, skill: e.target.value }
                          }))}
                          className="p-2 bg-gray-600/50 border border-gray-500/50 rounded text-white"
                        />
                        <input
                          type="number"
                          value={editingItem.data.demandScore}
                          onChange={(e) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, demandScore: parseInt(e.target.value) || 0 }
                          }))}
                          className="p-2 bg-gray-600/50 border border-gray-500/50 rounded text-white"
                          min="0"
                          max="100"
                        />
                        <div className="col-span-2 flex space-x-2">
                          <button
                            onClick={() => handleUpdateSkill(skill.id, editingItem.data)}
                            className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="flex-1 bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' :
                            index === 1 ? 'bg-gray-400/20 text-gray-300 border-gray-400/30' :
                            index === 2 ? 'bg-orange-500/20 text-orange-400 border-orange-400/30' :
                            'bg-green-500/20 text-green-400 border-green-400/30'
                          }`}>
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <span className="font-medium text-white">{skill.skill}</span>
                            <span className="text-green-400 ml-3 font-bold">{skill.demandScore}%</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingItem({ id: skill.id, type: 'skill', data: { ...skill } })}
                            className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-colors"
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
          <h3 className="text-lg font-bold text-white mb-4">Hiring Domains Management</h3>
          
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
            <h4 className="text-md font-semibold text-white mb-3">Add New Domain</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Domain name"
                value={newDomain.domain}
                onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
                className="p-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
              <input
                type="number"
                placeholder="Job openings"
                value={newDomain.openings}
                onChange={(e) => setNewDomain({ ...newDomain, openings: parseInt(e.target.value) || 0 })}
                className="p-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
              <button
                onClick={handleAddDomain}
                disabled={!newDomain.domain.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Add Domain
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-white mb-3">
              Current Domains ({trendsData.hiringDomains.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trendsData.hiringDomains
                .sort((a, b) => b.openings - a.openings)
                .map((domain, index) => (
                  <div key={domain.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 hover:bg-gray-700/50 transition-colors">
                    {editingItem?.id === domain.id && editingItem?.type === 'domain' ? (
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editingItem.data.domain}
                          onChange={(e) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, domain: e.target.value }
                          }))}
                          className="p-2 bg-gray-600/50 border border-gray-500/50 rounded text-white"
                        />
                        <input
                          type="number"
                          value={editingItem.data.openings}
                          onChange={(e) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, openings: parseInt(e.target.value) || 0 }
                          }))}
                          className="p-2 bg-gray-600/50 border border-gray-500/50 rounded text-white"
                        />
                        <div className="col-span-2 flex space-x-2">
                          <button
                            onClick={() => handleUpdateDomain(domain.id, editingItem.data)}
                            className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="flex-1 bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                            index === 0 ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' :
                            index === 1 ? 'bg-purple-500/20 text-purple-400 border-purple-400/30' :
                            index === 2 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30' :
                            'bg-indigo-500/20 text-indigo-400 border-indigo-400/30'
                          }`}>
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <span className="font-medium text-white">{domain.domain}</span>
                            <span className="text-blue-400 ml-3 font-bold">{domain.openings.toLocaleString()} openings</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingItem({ id: domain.id, type: 'domain', data: { ...domain } })}
                            className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDomain(domain.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-colors"
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
          <h3 className="text-lg font-bold text-white mb-4">Salary Comparison Management</h3>
          
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
            <h4 className="text-md font-semibold text-white mb-3">Add Salary Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Job role"
                value={newSalary.role}
                onChange={(e) => setNewSalary({ ...newSalary, role: e.target.value })}
                className="p-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              />
              <input
                type="number"
                placeholder="India (LPA)"
                value={newSalary.india}
                onChange={(e) => setNewSalary({ ...newSalary, india: parseInt(e.target.value) || 0 })}
                className="p-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              />
              <input
                type="number"
                placeholder="Abroad (k USD)"
                value={newSalary.abroad}
                onChange={(e) => setNewSalary({ ...newSalary, abroad: parseInt(e.target.value) || 0 })}
                className="p-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              />
              <button
                onClick={handleAddSalary}
                disabled={!newSalary.role.trim()}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Add Salary
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-white mb-3">
              Current Salary Comparisons ({trendsData.salaryComparison.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trendsData.salaryComparison.map((salary) => (
                <div key={salary.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 hover:bg-gray-700/50 transition-colors">
                  {editingItem?.id === salary.id && editingItem?.type === 'salary' ? (
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={editingItem.data.role}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, role: e.target.value }
                        }))}
                        className="p-2 bg-gray-600/50 border border-gray-500/50 rounded text-white"
                        placeholder="Role"
                      />
                      <input
                        type="number"
                        value={editingItem.data.india}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, india: parseInt(e.target.value) || 0 }
                        }))}
                        className="p-2 bg-gray-600/50 border border-gray-500/50 rounded text-white"
                        placeholder="India LPA"
                      />
                      <input
                        type="number"
                        value={editingItem.data.abroad}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, abroad: parseInt(e.target.value) || 0 }
                        }))}
                        className="p-2 bg-gray-600/50 border border-gray-500/50 rounded text-white"
                        placeholder="Abroad k USD"
                      />
                      <div className="col-span-3 flex space-x-2">
                        <button
                          onClick={() => handleUpdateSalary(salary.id, editingItem.data)}
                          className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="flex-1 bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-medium text-white">{salary.role}</span>
                        <div className="flex space-x-4 mt-1">
                          <span className="text-cyan-400 text-sm">₹{salary.india}L (India)</span>
                          <span className="text-green-400 text-sm">${salary.abroad}k (Abroad)</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingItem({ id: salary.id, type: 'salary', data: { ...salary } })}
                          className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSalary(salary.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-colors"
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
          <h3 className="text-lg font-bold text-white mb-4">Hot Articles Management</h3>
          
          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
            <h4 className="text-md font-semibold text-white mb-3">Add New Article</h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Article title"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                className="w-full p-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
              <textarea
                placeholder="Article summary"
                value={newArticle.summary}
                onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })}
                className="w-full p-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                rows={3}
              />
              <input
                type="url"
                placeholder="Article URL"
                value={newArticle.url}
                onChange={(e) => setNewArticle({ ...newArticle, url: e.target.value })}
                className="w-full p-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
              <button
                onClick={handleAddArticle}
                disabled={!newArticle.title.trim() || !newArticle.summary.trim()}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Add Article
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-white mb-3">
              Current Articles ({trendsData.hotArticles.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trendsData.hotArticles.map((article) => (
                <div key={article.id} className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 hover:bg-gray-700/50 transition-colors">
                  {editingItem?.id === article.id && editingItem?.type === 'article' ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingItem.data.title}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, title: e.target.value }
                        }))}
                        className="w-full p-2 bg-gray-600/50 border border-gray-500/50 rounded text-white"
                        placeholder="Title"
                      />
                      <textarea
                        value={editingItem.data.summary}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, summary: e.target.value }
                        }))}
                        rows={3}
                        className="w-full p-2 bg-gray-600/50 border border-gray-500/50 rounded text-white"
                        placeholder="Summary"
                      />
                      <input
                        type="url"
                        value={editingItem.data.url}
                        onChange={(e) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, url: e.target.value }
                        }))}
                        className="w-full p-2 bg-gray-600/50 border border-gray-500/50 rounded text-white"
                        placeholder="URL"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateArticle(article.id, editingItem.data)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-white mb-1">{article.title}</h5>
                        <p className="text-purple-300 text-sm mb-2 line-clamp-2">{article.summary}</p>
                        <a href={article.url} className="text-purple-400 text-xs hover:text-purple-300">
                          {article.url}
                        </a>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setEditingItem({ id: article.id, type: 'article', data: { ...article } })}
                          className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-colors"
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