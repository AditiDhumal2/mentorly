'use client';

import { CommunityPost } from '@/types/community';
import { useState } from 'react';

interface AdminFiltersProps {
  posts: CommunityPost[];
  onFilterChange: (filteredPosts: CommunityPost[]) => void;
}

export default function AdminFilters({ posts, onFilterChange }: AdminFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    applyFilters(category, searchTerm);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    applyFilters(selectedCategory, term);
  };

  const applyFilters = (category: string, search: string) => {
    let filtered = posts;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(post => post.category === category);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase()) ||
        post.userName.toLowerCase().includes(search.toLowerCase())
      );
    }

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    onFilterChange(posts);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts, content, or users..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="query">Questions</option>
              <option value="discussion">Discussions</option>
              <option value="announcement">Announcements</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}