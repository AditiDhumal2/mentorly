// app/admin/placementhub/components/SkillsManager.tsx

'use client';

import { useState } from 'react';
import { updateSkills } from '@/actions/placementhub-admin-actions';

interface SkillsManagerProps {
  initialMustHaveSkills: string[];
  initialGoodToHaveSkills: string[];
}

export function SkillsManager({ initialMustHaveSkills, initialGoodToHaveSkills }: SkillsManagerProps) {
  const [mustHaveSkills, setMustHaveSkills] = useState(initialMustHaveSkills.join(', '));
  const [goodToHaveSkills, setGoodToHaveSkills] = useState(initialGoodToHaveSkills.join(', '));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const mustHaveArray = mustHaveSkills.split(',').map(skill => skill.trim()).filter(Boolean);
      const goodToHaveArray = goodToHaveSkills.split(',').map(skill => skill.trim()).filter(Boolean);

      const result = await updateSkills(mustHaveArray, goodToHaveArray);
      setMessage(result.message);
    } catch (error) {
      setMessage('Error updating skills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Skills</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Must-Have Skills (comma separated)
          </label>
          <textarea
            value={mustHaveSkills}
            onChange={(e) => setMustHaveSkills(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Data Structures, Algorithms, OOP, DBMS..."
          />
          <p className="text-xs text-gray-500 mt-1">Separate each skill with a comma</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Good-to-Have Skills (comma separated)
          </label>
          <textarea
            value={goodToHaveSkills}
            onChange={(e) => setGoodToHaveSkills(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="React, Node.js, AWS, Machine Learning..."
          />
          <p className="text-xs text-gray-500 mt-1">Separate each skill with a comma</p>
        </div>

        {message && (
          <div className={`p-3 rounded-md ${
            message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Updating Skills...' : 'Update Skills'}
        </button>
      </form>
    </div>
  );
}