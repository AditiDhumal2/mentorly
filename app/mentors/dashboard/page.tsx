 import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import { redirect } from 'next/navigation';

export default async function MentorDashboardPage() {
  // We'll keep the auth check here to ensure the page can access user data
  const currentUser = await getCurrentUserForMentorRoute();
  
  if (!currentUser) {
    redirect('/mentors-auth/login');
  }

  // Get user initials for avatar fallback
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part: string) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Welcome back, {currentUser.name}! 🎓
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Mentor Dashboard - {currentUser.college || 'Your Institution'}
              </p>
              <div className="flex items-center space-x-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  currentUser.approvalStatus === 'approved' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                  {currentUser.approvalStatus || 'pending'}
                </div>
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  Profile: {currentUser.profileCompleted ? 'Complete' : 'Incomplete'}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-6">
              {currentUser.profilePhoto ? (
                <img 
                  src={currentUser.profilePhoto} 
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {getUserInitials(currentUser.name)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Approval Status</p>
                <p className="text-2xl font-bold text-gray-900 capitalize mt-2">
                  {currentUser.approvalStatus || 'pending'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Account Status</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Profile Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {currentUser.profileCompleted ? 'Complete' : 'In Progress'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Completion</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Expertise Areas</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {currentUser.expertise?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Areas of Expertise</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 text-xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 uppercase tracking-wide">Experience</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {currentUser.experience || 0} {currentUser.experience === 1 ? 'year' : 'years'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Professional Experience</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <span className="text-orange-600 text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a 
                  href="/mentors/sessions"
                  className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xl">📅</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Session Requests</h3>
                      <p className="text-blue-100 text-sm opacity-90">Manage student sessions and availability</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                <a 
                  href="/mentors/community"
                  className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xl">💬</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Community Forum</h3>
                      <p className="text-green-100 text-sm opacity-90">Connect with other mentors and students</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                <a 
                  href="/mentors/messages"
                  className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xl">✉️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Messages</h3>
                      <p className="text-purple-100 text-sm opacity-90">Personal messaging with students</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                <a 
                  href="/mentors/students"
                  className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xl">👥</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Students</h3>
                      <p className="text-orange-100 text-sm opacity-90">Manage your student connections</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                <a 
                  href="/mentors/profile"
                  className="group bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xl">👤</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Profile</h3>
                      <p className="text-pink-100 text-sm opacity-90">Edit your profile and preferences</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>

                <div className="group bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-xl shadow-md border border-teal-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📊</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Analytics</h3>
                      <p className="text-teal-100 text-sm opacity-90">View your mentoring insights</p>
                    </div>
                    <div className="text-teal-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Profile Summary - 1/3 width */}
          <div className="space-y-8">
            {/* Profile Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Expertise Areas</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentUser.expertise?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">College</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentUser.college || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentUser.experience || 0} years
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Profile Approved</p>
                    <p className="text-xs text-gray-600 mt-1">Your mentor profile has been approved and is now active</p>
                    <p className="text-xs text-blue-600 mt-1">Just now</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-sm">🎓</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Expertise Added</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Added {currentUser.expertise?.length || 0} area{currentUser.expertise?.length !== 1 ? 's' : ''} of expertise
                    </p>
                    <p className="text-xs text-green-600 mt-1">Recently</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-sm">🚀</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Ready to Mentor</p>
                    <p className="text-xs text-gray-600 mt-1">You're all set to start mentoring students</p>
                    <p className="text-xs text-purple-600 mt-1">Today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-blue-100 text-xs mt-1">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-blue-100 text-xs mt-1">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">5.0</div>
                  <div className="text-blue-100 text-xs mt-1">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-blue-100 text-xs mt-1">Messages</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-indigo-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started as a Mentor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 text-lg">📅</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Set Availability</h3>
              <p className="text-sm text-gray-600">Define your available time slots for sessions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-lg">👥</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
              <p className="text-sm text-gray-600">Start connecting with students in your expertise areas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-pink-600 text-lg">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Communicate</h3>
              <p className="text-sm text-gray-600">Use messages to coordinate with students</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-lg">⭐</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Grow</h3>
              <p className="text-sm text-gray-600">Build your reputation and help students succeed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}