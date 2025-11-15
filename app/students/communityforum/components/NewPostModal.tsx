'use client';

import { useState } from 'react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; category: string; visibility: 'public' | 'students' }) => void;
  currentUser: any;
  defaultVisibility?: 'public' | 'students';
}

export default function NewPostModal({ isOpen, onClose, onSubmit, currentUser, defaultVisibility = 'public' }: NewPostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'general' | 'academic' | 'career' | 'technical'>('general');
  const [visibility, setVisibility] = useState<'public' | 'students'>(defaultVisibility);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit({ title, content, category, visibility });
      setTitle('');
      setContent('');
      setCategory('general');
      setVisibility(defaultVisibility);
    }
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    switch (visibility) {
      case 'students':
        return '👥 Create Student Chat';
      default:
        return '💬 Ask Mentor Question';
    }
  };

  const getVisibilityDescription = () => {
    switch (visibility) {
      case 'public':
        return '🌍 This question will be visible to all mentors and students in the community forum. Mentors can help answer your questions!';
      case 'students':
        return '👥 This chat will only be visible to other students. Mentors will not see this.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {getModalTitle()}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="general">General Discussion</option>
                  <option value="academic">Academic Help</option>
                  <option value="career">Career Advice</option>
                  <option value="technical">Technical Help</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="public">🌍 Ask Mentors (Public)</option>
                  <option value="students">👥 Student Chat (Private)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter post title..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your post content..."
                required
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Posting as:</h4>
              <p className="text-blue-700">
                {currentUser?.name} (👨‍🎓 Student)
              </p>
              <p className="text-blue-600 text-sm mt-2">
                {getVisibilityDescription()}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}