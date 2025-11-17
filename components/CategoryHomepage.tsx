'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryInfo } from '@/types/community';
import { getCategoriesForUser } from '@/actions/community-categories-actions';

interface CategoryHomepageProps {
  userRole: 'student' | 'mentor' | 'admin' | null;
  userName: string | null;
  userType: 'student' | 'mentor' | 'admin';
}

export default function CategoryHomepage({ userRole, userName, userType }: CategoryHomepageProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [userRole]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategoriesForUser(userRole);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: CategoryInfo) => {
    if (userType === 'student') {
      router.push(`/students/communityforum?category=${category.id}`);
    } else if (userType === 'mentor') {
      router.push(`/mentors/community?category=${category.id}`);
    } else if (userType === 'admin') {
      router.push(`/admin/communityforum?category=${category.id}`);
    }
  };

  const getCategoryVisibilityInfo = (category: CategoryInfo) => {
    if (category.visibility.includes('admin-mentors') && category.visibility.length === 1) {
      return '🔒 Admin & Mentors Only';
    } else if (category.visibility.includes('mentors') && !category.visibility.includes('students')) {
      return '👨‍🏫 Mentors Only';
    } else if (category.visibility.includes('students') && !category.visibility.includes('public')) {
      return '👥 Students Only';
    } else {
      return '🌍 Everyone';
    }
  };

  const getUserForumPath = () => {
    if (userType === 'student') return '/students/communityforum';
    if (userType === 'mentor') return '/mentors/community';
    if (userType === 'admin') return '/admin/communityforum';
    return '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Community Forum
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect, learn, and grow with our community. Choose a category to start exploring discussions.
          </p>
          {userName && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
              <span className="text-sm text-gray-600">Welcome,</span>
              <span className="font-semibold text-blue-600">{userName}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                {userRole}
              </span>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-gray-200 overflow-hidden"
            >
              {/* Category Header with Gradient */}
              <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl">{category.icon}</div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold">
                    {category.postCount} posts
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <div className="text-white/90 text-sm font-medium">
                  {getCategoryVisibilityInfo(category)}
                </div>
              </div>

              {/* Category Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Tap to explore
                  </span>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Community Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {categories.reduce((total, cat) => total + cat.postCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {categories.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {categories.filter(cat => cat.postCount > 0).length}
              </div>
              <div className="text-sm text-gray-600">Active Categories</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {userRole ? 'Online' : 'Guest'}
              </div>
              <div className="text-sm text-gray-600">Your Status</div>
            </div>
          </div>
        </div>

        {/* View All Posts Button */}
        <div className="text-center">
          <button
            onClick={() => router.push(getUserForumPath())}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            View All Posts Without Filter
          </button>
        </div>
      </div>
    </div>
  );
}