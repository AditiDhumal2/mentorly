// app/admin/placementhub/components/CodingProblemsManager.tsx

'use client';

import { useState } from 'react';
import { CodingProblem } from '@/types/placementhub';
import { addCodingProblem, deleteCodingProblem } from '@/actions/placementhub-admin-actions';

interface CodingProblemsManagerProps {
  initialProblems: CodingProblem[];
}

export function CodingProblemsManager({ initialProblems }: CodingProblemsManagerProps) {
  const [problems, setProblems] = useState<CodingProblem[]>(initialProblems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [newProblem, setNewProblem] = useState<CodingProblem>({
    title: '',
    platform: 'LeetCode',
    url: ''
  });

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await addCodingProblem(newProblem);
      setProblems([...problems, newProblem]);
      setNewProblem({ title: '', platform: 'LeetCode', url: '' });
      setShowAddForm(false);
      setMessage(result.message);
    } catch (error) {
      setMessage('Error adding problem');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProblem = async (index: number) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    setLoading(true);
    try {
      const result = await deleteCodingProblem(index);
      setProblems(problems.filter((_, i) => i !== index));
      setMessage(result.message);
    } catch (error) {
      setMessage('Error deleting problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Manage Coding Problems</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Add New Problem
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Add New Coding Problem</h4>
          <form onSubmit={handleAddProblem} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Problem Title"
                value={newProblem.title}
                onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={newProblem.platform}
                onChange={(e) => setNewProblem({ ...newProblem, platform: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LeetCode">LeetCode</option>
                <option value="HackerRank">HackerRank</option>
                <option value="CodeChef">CodeChef</option>
                <option value="Codeforces">Codeforces</option>
                <option value="AtCoder">AtCoder</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
              </select>
              <input
                type="url"
                placeholder="Problem URL"
                value={newProblem.url}
                onChange={(e) => setNewProblem({ ...newProblem, url: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding...' : 'Add Problem'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-md mb-4 ${
          message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-2">
        {problems.map((problem, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{problem.title}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{problem.platform}</span>
                <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800">
                  View Problem
                </a>
              </div>
            </div>
            <button
              onClick={() => handleDeleteProblem(index)}
              disabled={loading}
              className="ml-4 bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {problems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No coding problems added yet. Click "Add New Problem" to get started.
        </div>
      )}
    </div>
  );
}