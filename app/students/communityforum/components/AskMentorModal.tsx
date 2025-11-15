'use client';

import { useState, useEffect } from 'react';
import { getAllMentors, getMentorsByExpertise } from '@/actions/mentor-actions';

// Define Mentor interface locally since it's not in community types
interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  experience: number;
  qualification: string;
  bio: string;
  availability: string;
  rating: number;
  totalSessions: number;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  profiles: any;
  stats: any;
}

interface AskMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    category: string;
    selectedMentorId?: string;
    selectedMentorName?: string;
    visibility: 'public' | 'students' | 'mentors';
  }) => void;
  currentUser: any;
}

export default function AskMentorModal({ isOpen, onClose, onSubmit, currentUser }: AskMentorModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('technical');
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [selectedMentorName, setSelectedMentorName] = useState('');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [postType, setPostType] = useState<'general' | 'mentor-specific'>('general');

  useEffect(() => {
    if (isOpen) {
      loadMentors();
    }
  }, [isOpen]);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const mentorsData = await getAllMentors();
      setMentors(mentorsData);
      setFilteredMentors(mentorsData);
    } catch (error) {
      console.error('Error loading mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredMentors(mentors);
      return;
    }

    const filtered = mentors.filter(mentor =>
      mentor.name.toLowerCase().includes(term.toLowerCase()) ||
      mentor.expertise.some((exp: string) => exp.toLowerCase().includes(term.toLowerCase())) ||
      mentor.skills.some((skill: string) => skill.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredMentors(filtered);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setSelectedMentorId('');
    setSelectedMentorName('');
    
    // Filter mentors by expertise based on category
    if (newCategory && mentors.length > 0) {
      const categoryToExpertise: Record<string, string> = {
        technical: 'Programming',
        academic: 'Mathematics',
        career: 'Career Guidance',
        general: 'General'
      };

      const expertise = categoryToExpertise[newCategory] || newCategory;
      const filtered = mentors.filter(mentor =>
        mentor.expertise.some((exp: string) => 
          exp.toLowerCase().includes(expertise.toLowerCase())
        )
      );
      setFilteredMentors(filtered);
    } else {
      setFilteredMentors(mentors);
    }
  };

  const handleMentorSelect = (mentorId: string, mentorName: string) => {
    if (selectedMentorId === mentorId) {
      setSelectedMentorId('');
      setSelectedMentorName('');
      setPostType('general');
    } else {
      setSelectedMentorId(mentorId);
      setSelectedMentorName(mentorName);
      setPostType('mentor-specific');
    }
  };

  const handlePostTypeChange = (type: 'general' | 'mentor-specific') => {
    setPostType(type);
    if (type === 'general') {
      setSelectedMentorId('');
      setSelectedMentorName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit({
        title,
        content,
        category,
        selectedMentorId: postType === 'mentor-specific' ? selectedMentorId : undefined,
        selectedMentorName: postType === 'mentor-specific' ? selectedMentorName : undefined,
        visibility: postType === 'mentor-specific' ? 'mentors' : 'public'
      });
      setTitle('');
      setContent('');
      setCategory('technical');
      setSelectedMentorId('');
      setSelectedMentorName('');
      setSearchTerm('');
      setPostType('general');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Ask a Question</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Type Selection */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">Question Type</h3>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="postType"
                    value="general"
                    checked={postType === 'general'}
                    onChange={() => handlePostTypeChange('general')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-blue-800 font-medium">
                    🌍 General Question (All mentors can see and answer)
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="postType"
                    value="mentor-specific"
                    checked={postType === 'mentor-specific'}
                    onChange={() => handlePostTypeChange('mentor-specific')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-blue-800 font-medium">
                    👨‍🏫 Ask Specific Mentor (Private to selected mentor)
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="technical">💻 Technical Help</option>
                  <option value="academic">📚 Academic Help</option>
                  <option value="career">💼 Career Advice</option>
                  <option value="general">💬 General Question</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Mentors {postType === 'mentor-specific' && '*'}
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by name, expertise, or skills..."
                  disabled={postType === 'general'}
                />
              </div>
            </div>

            {/* Mentors List - Only show for mentor-specific questions */}
            {postType === 'mentor-specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Mentor *
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading mentors...</div>
                  ) : filteredMentors.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm ? 'No mentors found. Try different search terms.' : 'No mentors available.'}
                    </div>
                  ) : (
                    filteredMentors.map((mentor) => (
                      <div
                        key={mentor.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                          selectedMentorId === mentor.id 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleMentorSelect(mentor.id, mentor.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {mentor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{mentor.name}</h4>
                              <p className="text-sm text-gray-600">
                                {mentor.expertise.slice(0, 3).join(', ')}
                                {mentor.expertise.length > 3 && '...'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                ⭐ {mentor.rating}/5 • {mentor.experience} years exp • {mentor.totalSessions} sessions
                              </p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedMentorId === mentor.id 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'border-gray-300'
                          }`}>
                            {selectedMentorId === mentor.id && (
                              <span className="text-xs">✓</span>
                            )}
                          </div>
                        </div>
                        {selectedMentorId === mentor.id && (
                          <div className="mt-3 pl-16">
                            <p className="text-sm text-gray-600 mb-2">{mentor.bio}</p>
                            <div className="flex flex-wrap gap-1">
                              {mentor.skills.slice(0, 5).map((skill, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {mentor.skills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{mentor.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What's your question? Be specific..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Question *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Describe your question in detail...${
                  postType === 'mentor-specific' && selectedMentorName 
                    ? `\n\nThis question will be privately sent to ${selectedMentorName}`
                    : ''
                }`}
                required
              />
            </div>
            
            {/* Summary Card */}
            <div className={`p-4 rounded-lg ${
              postType === 'mentor-specific' ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50'
            }`}>
              <h4 className="font-semibold text-gray-800 mb-2">
                {postType === 'mentor-specific' ? '🔒 Private Question to Mentor' : '🌍 Public Question'}
              </h4>
              <p className="text-gray-700">
                <strong>Posting as:</strong> {currentUser?.name} (👨‍🎓 Student)
              </p>
              {postType === 'mentor-specific' && selectedMentorName ? (
                <p className="text-purple-700 text-sm mt-1">
                  This question will be privately sent to <strong>{selectedMentorName}</strong>. 
                  Only you and {selectedMentorName} can see and discuss this question.
                </p>
              ) : (
                <p className="text-blue-700 text-sm mt-1">
                  This question will be visible to all mentors and students in the community forum.
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={postType === 'mentor-specific' && !selectedMentorId}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {postType === 'mentor-specific' ? `Ask ${selectedMentorName || 'Mentor'}` : 'Post Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}