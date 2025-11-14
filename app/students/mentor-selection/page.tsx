'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MentorCard from './components/mentor-card';
import MentorFilters from './components/mentor-filters';
import SessionRequestModal from './components/session-request-modal';
import Snackbar from '@/components/Snackbar';
import { Mentor, MentorSearchParams } from '@/types/mentor-selection';
import { getApprovedMentors } from '@/actions/students-mentorselect-actions';
import { getCurrentUser } from '@/actions/userActions';

export default function MentorSelectionPage() {
  const router = useRouter();
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchParams, setSearchParams] = useState<MentorSearchParams>({
    searchQuery: '',
    filters: {
      expertise: [],
      minExperience: 0,
      maxExperience: 0,
      minRating: 0
    },
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Get current user using your existing auth system
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        showSnackbar('Please log in to access mentor selection', 'error');
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  // Fetch mentors when search params change
  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      const result = await getApprovedMentors(searchParams);
      
      if (result.success) {
        setMentors(result.mentors);
        setPagination(result.pagination);
      } else {
        console.error('Failed to fetch mentors:', result.error);
        showSnackbar('Failed to load mentors. Please try again.', 'error');
      }
      setLoading(false);
    };

    if (user) {
      fetchMentors();
    }
  }, [searchParams, user]);

  // Snackbar helper functions
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSearchChange = (query: string) => {
    setSearchParams(prev => ({
      ...prev,
      searchQuery: query,
      page: 1
    }));
  };

  const handleFiltersChange = (filters: any) => {
    setSearchParams(prev => ({
      ...prev,
      filters,
      page: 1
    }));
  };

  const handleMentorSelect = (mentor: Mentor) => {
    // Check if user is authenticated before showing session modal
    if (!user) {
      showSnackbar('Please log in to request a session', 'error');
      router.push('/login');
      return;
    }
    setSelectedMentor(mentor);
    setShowSessionModal(true);
  };

  const handleSessionSuccess = () => {
    showSnackbar('Session request sent successfully! The mentor will review your request.', 'success');
  };

  const handleSessionError = (message: string) => {
    showSnackbar(message, 'error');
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Mentor</h1>
          <p className="text-gray-600 mt-2">
            Connect with experienced mentors who can guide you in your academic and career journey
          </p>
        </div>

        {/* Filters */}
        <MentorFilters
          searchQuery={searchParams.searchQuery || ''}
          filters={searchParams.filters}
          onSearchChange={handleSearchChange}
          onFiltersChange={handleFiltersChange}
        />

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Available Mentors
            </h2>
            <p className="text-gray-600 text-sm">
              {loading ? 'Loading...' : `Showing ${mentors.length} of ${pagination.total} mentors`}
            </p>
          </div>
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor._id}
                mentor={mentor}
                onSelect={handleMentorSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more mentors.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page! - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <button
              onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page! + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Session Request Modal */}
        <SessionRequestModal
          mentor={selectedMentor}
          studentId={user?._id || user?.email || 'demo-user'}
          isOpen={showSessionModal}
          onClose={() => setShowSessionModal(false)}
          onSuccess={handleSessionSuccess}
          onError={handleSessionError}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={hideSnackbar}
          autoHideDuration={6000}
        />
      </div>
    </div>
  );
}