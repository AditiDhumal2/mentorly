'use client';

import { useState } from 'react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; category: string; visibility: 'public' | 'mentors' | 'students' | 'admin-mentors' }) => void;
  currentUser: any;
  postType?: 'announcement' | 'mentor-chat' | 'student-post' | 'admin-mentor-chat';
}

export default function NewPostModal({ isOpen, onClose, onSubmit, currentUser, postType = 'announcement' }: NewPostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Updated category options with new categories
  const categoryOptions = [
    { value: 'higher-education', label: '🎓 Higher Education' },
    { value: 'market-trends', label: '📈 Market Trends' },
    { value: 'domains', label: '🔧 Domains & Specializations' },
    { value: 'placements', label: '💼 Placements & Careers' },
    { value: 'general', label: '💬 General Discussion' },
    { value: 'academic', label: '📚 Academic Help' },
    { value: 'career', label: '🚀 Career Advice' },
    { value: 'technical', label: '💻 Technical Help' },
    { value: 'announcement', label: '📢 Announcement' },
  ];
  
  const [category, setCategory] = useState<'higher-education' | 'market-trends' | 'domains' | 'placements' | 'general' | 'academic' | 'career' | 'technical' | 'announcement'>('general');
  
  // Set default visibility based on postType
  const getDefaultVisibility = () => {
    switch (postType) {
      case 'announcement':
        return 'public';
      case 'mentor-chat':
        return 'mentors';
      case 'student-post':
        return 'students';
      case 'admin-mentor-chat':
        return 'admin-mentors';
      default:
        return 'public';
    }
  };

  const [visibility, setVisibility] = useState<'public' | 'mentors' | 'students' | 'admin-mentors'>(getDefaultVisibility());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      // For announcements, use 'announcement' category with 'public' visibility
      const finalCategory = postType === 'announcement' ? 'announcement' : category;
      const finalVisibility = postType === 'announcement' ? 'public' : visibility;
      
      onSubmit({ title, content, category: finalCategory, visibility: finalVisibility });
      setTitle('');
      setContent('');
      setCategory('general');
      setVisibility(getDefaultVisibility());
    }
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    switch (postType) {
      case 'announcement':
        return '📢 Create Announcement';
      case 'mentor-chat':
        return '👨‍🏫 Create Mentor Chat';
      case 'student-post':
        return '👥 Create Student Post';
      case 'admin-mentor-chat':
        return '🔒 Create Admin-Mentor Chat';
      default:
        return 'Create Post';
    }
  };

  const getVisibilityDescription = () => {
    switch (visibility) {
      case 'public':
        return postType === 'announcement' 
          ? '📢 This announcement will be visible to all students and mentors. Students can read but cannot reply.'
          : '🌍 This post will be visible to everyone (students and mentors).';
      case 'students':
        return '👥 This post will be visible to students only. Students can read and reply to ask questions.';
      case 'mentors':
        return '👨‍🏫 This chat will only be visible to other mentors and admins.';
      case 'admin-mentors':
        return '🔒 This chat will only be visible to administrators and mentors.';
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
                  disabled={postType === 'announcement'}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  disabled={postType === 'announcement'}
                >
                  <option value="public">🌍 Public (Everyone)</option>
                  <option value="students">👥 Students Only</option>
                  <option value="mentors">👨‍🏫 Mentor Chats</option>
                  <option value="admin-mentors">🔒 Admin-Mentor</option>
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
            
            <div className={`p-4 rounded-lg ${
              postType === 'announcement' ? 'bg-green-50 border border-green-200' :
              visibility === 'students' ? 'bg-orange-50 border border-orange-200' :
              visibility === 'mentors' ? 'bg-purple-50 border border-purple-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <h4 className="font-semibold text-gray-800 mb-2">
                Posting as: {currentUser?.name} (👨‍🏫 Mentor)
              </h4>
              <p className="text-sm mt-2">
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