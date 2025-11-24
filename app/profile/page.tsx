// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { uploadProfilePhotoAction } from '@/actions/profile-actions';
import { getCurrentUser, studentLogout, mentorLogout } from '@/actions/userActions';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        setMessage('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const result = await uploadProfilePhotoAction(user._id, user.role as 'student' | 'mentor', formData);

      if (result.success && result.imageUrl) {
        setMessage('Profile photo saved successfully!');
        setUser({ ...user, profilePhoto: result.imageUrl });
      } else {
        setMessage(result.error || 'Failed to save photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage('Error saving photo');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.role === 'student') {
        await studentLogout();
        router.push('/students-auth/login');
      } else if (user?.role === 'mentor') {
        await mentorLogout();
        router.push('/mentors-auth/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="text-blue-600 hover:text-blue-800"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">View Profile</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
          
          {/* Profile Photo Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
            
            <div className="flex items-center space-x-6">
              {/* Current Profile Photo */}
              <div className="flex-shrink-0">
                {user.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload New Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB. Images are optimized and stored securely in the cloud.
                  </p>

                  {uploading && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Uploading to cloud...</span>
                    </div>
                  )}

                  {message && (
                    <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                      {message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                  {user.name}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                  {user.email}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border capitalize">
                  {user.role}
                </p>
              </div>
              
              {user.college && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    {user.college}
                  </p>
                </div>
              )}
              
              {user.year && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    Year {user.year}
                  </p>
                </div>
              )}

              {user.expertise && user.expertise.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expertise
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user.expertise.map((skill: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.interests && user.interests.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.role === 'student' ? (
                <>
                  <button 
                    onClick={() => router.push('/students')}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="font-medium">Student Dashboard</div>
                    <div className="text-sm text-blue-600">View your learning progress</div>
                  </button>
                  <button 
                    onClick={() => router.push('/messages')}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 hover:bg-green-100 transition-colors text-left"
                  >
                    <div className="font-medium">Messages</div>
                    <div className="text-sm text-green-600">Chat with mentors</div>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => router.push('/mentors/dashboard')}
                    className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors text-left"
                  >
                    <div className="font-medium">Mentor Dashboard</div>
                    <div className="text-sm text-purple-600">Manage your sessions</div>
                  </button>
                  <button 
                    onClick={() => router.push('/messages')}
                    className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors text-left"
                  >
                    <div className="font-medium">Messages</div>
                    <div className="text-sm text-indigo-600">Chat with students</div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}