'use client';

import { useState, useEffect } from 'react';
import { 
  getTrendsData, 
  updateTrendsData, 
  type TrendsData, 
  type TrendingSkill, 
  type HiringDomain, 
  type SalaryComparison, 
  type HotArticle 
} from './trendsaction';

// Type for editing items
type EditingItem = {
  id: string;
  type: 'skill' | 'domain' | 'salary' | 'article';
  data: any;
};

export default function AdminMarketTrendsPage() {
  const [trendsData, setTrendsData] = useState<TrendsData>({
    month: 'January 2024',
    updatedAt: new Date().toISOString(),
    apiSource: 'Industry Reports & Platform Analytics',
    trendingSkills: [],
    hiringDomains: [],
    salaryComparison: [],
    hotArticles: []
  });

  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [activeTab, setActiveTab] = useState('skills');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Form states for new items
  const [newSkill, setNewSkill] = useState({ skill: '', demandScore: 50 });
  const [newDomain, setNewDomain] = useState({ domain: '', openings: 1000 });
  const [newSalary, setNewSalary] = useState({ role: '', india: 10, abroad: 50 });
  const [newArticle, setNewArticle] = useState({ title: '', url: '', summary: '' });

  // Load data on component mount
  useEffect(() => {
    loadTrendsData();
  }, []);

  const loadTrendsData = async () => {
    try {
      setIsLoading(true);
      const data = await getTrendsData();
      setTrendsData(data);
    } catch (error) {
      console.error('Error loading trends data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD Operations for Trending Skills
  const addSkill = () => {
    if (!newSkill.skill.trim()) return;
    
    const skill: TrendingSkill = {
      id: Date.now().toString(),
      ...newSkill
    };
    
    setTrendsData(prev => ({
      ...prev,
      trendingSkills: [...prev.trendingSkills, skill]
    }));
    
    setNewSkill({ skill: '', demandScore: 50 });
  };

  const updateSkill = (id: string, updates: Partial<TrendingSkill>) => {
    setTrendsData(prev => ({
      ...prev,
      trendingSkills: prev.trendingSkills.map(skill =>
        skill.id === id ? { ...skill, ...updates } : skill
      )
    }));
    setEditingItem(null);
  };

  const deleteSkill = (id: string) => {
    setTrendsData(prev => ({
      ...prev,
      trendingSkills: prev.trendingSkills.filter(skill => skill.id !== id)
    }));
  };

  // CRUD Operations for Hiring Domains
  const addDomain = () => {
    if (!newDomain.domain.trim()) return;
    
    const domain: HiringDomain = {
      id: Date.now().toString(),
      ...newDomain
    };
    
    setTrendsData(prev => ({
      ...prev,
      hiringDomains: [...prev.hiringDomains, domain]
    }));
    
    setNewDomain({ domain: '', openings: 1000 });
  };

  const updateDomain = (id: string, updates: Partial<HiringDomain>) => {
    setTrendsData(prev => ({
      ...prev,
      hiringDomains: prev.hiringDomains.map(domain =>
        domain.id === id ? { ...domain, ...updates } : domain
      )
    }));
    setEditingItem(null);
  };

  const deleteDomain = (id: string) => {
    setTrendsData(prev => ({
      ...prev,
      hiringDomains: prev.hiringDomains.filter(domain => domain.id !== id)
    }));
  };

  // CRUD Operations for Salary Comparison
  const addSalary = () => {
    if (!newSalary.role.trim()) return;
    
    const salary: SalaryComparison = {
      id: Date.now().toString(),
      ...newSalary
    };
    
    setTrendsData(prev => ({
      ...prev,
      salaryComparison: [...prev.salaryComparison, salary]
    }));
    
    setNewSalary({ role: '', india: 10, abroad: 50 });
  };

  const updateSalary = (id: string, updates: Partial<SalaryComparison>) => {
    setTrendsData(prev => ({
      ...prev,
      salaryComparison: prev.salaryComparison.map(salary =>
        salary.id === id ? { ...salary, ...updates } : salary
      )
    }));
    setEditingItem(null);
  };

  const deleteSalary = (id: string) => {
    setTrendsData(prev => ({
      ...prev,
      salaryComparison: prev.salaryComparison.filter(salary => salary.id !== id)
    }));
  };

  // CRUD Operations for Hot Articles
  const addArticle = () => {
    if (!newArticle.title.trim() || !newArticle.summary.trim()) return;
    
    const article: HotArticle = {
      id: Date.now().toString(),
      ...newArticle
    };
    
    setTrendsData(prev => ({
      ...prev,
      hotArticles: [...prev.hotArticles, article]
    }));
    
    setNewArticle({ title: '', url: '', summary: '' });
  };

  const updateArticle = (id: string, updates: Partial<HotArticle>) => {
    setTrendsData(prev => ({
      ...prev,
      hotArticles: prev.hotArticles.map(article =>
        article.id === id ? { ...article, ...updates } : article
      )
    }));
    setEditingItem(null);
  };

  const deleteArticle = (id: string) => {
    setTrendsData(prev => ({
      ...prev,
      hotArticles: prev.hotArticles.filter(article => article.id !== id)
    }));
  };

  // Save all changes to server
  const saveChanges = async () => {
    try {
      setSaveStatus('saving');
      const result = await updateTrendsData(trendsData);
      
      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error saving trends data:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'success': return 'Saved!';
      case 'error': return 'Error!';
      default: return 'Save All Changes';
    }
  };

  const getSaveButtonClass = () => {
    const baseClass = "bg-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50";
    switch (saveStatus) {
      case 'success': return `${baseClass} text-green-600 hover:bg-green-50`;
      case 'error': return `${baseClass} text-red-600 hover:bg-red-50`;
      default: return `${baseClass} text-purple-600 hover:bg-purple-50`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trends data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-lg">📈</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Manage Market Trends</h1>
                <p className="text-purple-100 text-sm">Update and manage industry trends data</p>
              </div>
            </div>
            <button
              onClick={saveChanges}
              disabled={saveStatus === 'saving'}
              className={getSaveButtonClass()}
            >
              {getSaveButtonText()}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Last Updated Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-700 text-sm">
            <strong>Last Updated:</strong> {new Date(trendsData.updatedAt).toLocaleString()} | 
            <strong> Data Source:</strong> {trendsData.apiSource}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          {[
            { id: 'skills', label: 'Trending Skills', icon: '🚀' },
            { id: 'domains', label: 'Hiring Domains', icon: '💼' },
            { id: 'salaries', label: 'Salary Data', icon: '💰' },
            { id: 'articles', label: 'Hot Articles', icon: '🔥' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Trending Skills Management */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Trending Skills</h2>
              <span className="text-sm text-gray-500">
                {trendsData.trendingSkills.length} skills
              </span>
            </div>

            {/* Add New Skill Form */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Skill</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Skill name"
                  value={newSkill.skill}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkill(prev => ({ ...prev, skill: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newSkill.demandScore}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkill(prev => ({ ...prev, demandScore: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {newSkill.demandScore}%
                  </span>
                </div>
              </div>
              <button
                onClick={addSkill}
                disabled={!newSkill.skill.trim()}
                className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Add Skill
              </button>
            </div>

            {/* Skills List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendsData.trendingSkills.map((skill) => (
                <div key={skill.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  {editingItem?.id === skill.id && editingItem?.type === 'skill' ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingItem.data.skill}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, skill: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={editingItem.data.demandScore}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, demandScore: parseInt(e.target.value) }
                          }))}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-700 w-12">
                          {editingItem.data.demandScore}%
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateSkill(skill.id!, editingItem.data)}
                          className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{skill.skill}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingItem({ id: skill.id!, type: 'skill', data: { ...skill } })}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSkill(skill.id!)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                          style={{ width: `${skill.demandScore}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">Demand: {skill.demandScore}%</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hiring Domains Management */}
        {activeTab === 'domains' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Hiring Domains</h2>
              <span className="text-sm text-gray-500">
                {trendsData.hiringDomains.length} domains
              </span>
            </div>

            {/* Add New Domain Form */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Domain</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Domain name"
                  value={newDomain.domain}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDomain(prev => ({ ...prev, domain: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  placeholder="Job openings"
                  value={newDomain.openings}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDomain(prev => ({ ...prev, openings: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={addDomain}
                disabled={!newDomain.domain.trim()}
                className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Add Domain
              </button>
            </div>

            {/* Domains List */}
            <div className="space-y-4">
              {trendsData.hiringDomains.map((domain) => (
                <div key={domain.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  {editingItem?.id === domain.id && editingItem?.type === 'domain' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editingItem.data.domain}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, domain: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="number"
                        value={editingItem.data.openings}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, openings: parseInt(e.target.value) || 0 }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="md:col-span-2 flex space-x-2">
                        <button
                          onClick={() => updateDomain(domain.id!, editingItem.data)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors"
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{domain.domain}</h3>
                        <p className="text-gray-600">{domain.openings.toLocaleString()} job openings</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingItem({ id: domain.id!, type: 'domain', data: { ...domain } })}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDomain(domain.id!)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
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
        )}

        {/* Salary Comparison Management */}
        {activeTab === 'salaries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Salary Comparison</h2>
              <span className="text-sm text-gray-500">
                {trendsData.salaryComparison.length} roles
              </span>
            </div>

            {/* Add New Salary Form */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Salary Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Job role"
                  value={newSalary.role}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSalary(prev => ({ ...prev, role: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  placeholder="India salary (LPA)"
                  value={newSalary.india}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSalary(prev => ({ ...prev, india: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="number"
                  placeholder="Abroad salary (k USD)"
                  value={newSalary.abroad}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSalary(prev => ({ ...prev, abroad: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={addSalary}
                disabled={!newSalary.role.trim()}
                className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Add Salary Data
              </button>
            </div>

            {/* Salary List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendsData.salaryComparison.map((salary) => (
                <div key={salary.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  {editingItem?.id === salary.id && editingItem?.type === 'salary' ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingItem.data.role}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, role: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          value={editingItem.data.india}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, india: parseInt(e.target.value) || 0 }
                          }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="India LPA"
                        />
                        <input
                          type="number"
                          value={editingItem.data.abroad}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem(prev => ({
                            ...prev!,
                            data: { ...prev!.data, abroad: parseInt(e.target.value) || 0 }
                          }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Abroad k USD"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateSalary(salary.id!, editingItem.data)}
                          className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{salary.role}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingItem({ id: salary.id!, type: 'salary', data: { ...salary } })}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSalary(salary.id!)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-cyan-600 font-bold text-lg">₹{salary.india}L</div>
                          <div className="text-gray-500 text-sm">India</div>
                        </div>
                        <div>
                          <div className="text-green-600 font-bold text-lg">${salary.abroad}k</div>
                          <div className="text-gray-500 text-sm">Abroad</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hot Articles Management */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Hot Articles</h2>
              <span className="text-sm text-gray-500">
                {trendsData.hotArticles.length} articles
              </span>
            </div>

            {/* Add New Article Form */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Article</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Article title"
                  value={newArticle.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="url"
                  placeholder="Article URL"
                  value={newArticle.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewArticle(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  placeholder="Article summary"
                  value={newArticle.summary}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewArticle(prev => ({ ...prev, summary: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={addArticle}
                disabled={!newArticle.title.trim() || !newArticle.summary.trim()}
                className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Add Article
              </button>
            </div>

            {/* Articles List */}
            <div className="space-y-4">
              {trendsData.hotArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  {editingItem?.id === article.id && editingItem?.type === 'article' ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingItem.data.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, title: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Title"
                      />
                      <input
                        type="url"
                        value={editingItem.data.url}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, url: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="URL"
                      />
                      <textarea
                        value={editingItem.data.summary}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingItem(prev => ({
                          ...prev!,
                          data: { ...prev!.data, summary: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Summary"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateArticle(article.id!, editingItem.data)}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors"
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
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{article.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{article.summary}</p>
                          {article.url && (
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 text-sm inline-block mt-1"
                            >
                              Read more →
                            </a>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => setEditingItem({ id: article.id!, type: 'article', data: { ...article } })}
                            className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteArticle(article.id!)}
                            className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}