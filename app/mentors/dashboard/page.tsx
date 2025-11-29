 // app/mentors/dashboard/page.tsx
import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import { redirect } from 'next/navigation';

export default async function MentorDashboardPage() {
  const currentUser = await getCurrentUserForMentorRoute();
  
  if (!currentUser) {
    redirect('/mentors-auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Welcome back, {currentUser.name}! 🎓
              </h1>
              <p className="text-xl text-gray-600">
                Mentor Dashboard - {currentUser.college || 'Your Institution'}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                currentUser.approvalStatus === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                {currentUser.approvalStatus || 'pending'}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Profile: {currentUser.profileCompleted ? 'Complete' : 'Incomplete'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Approval Status</p>
                <p className="text-2xl font-bold text-gray-900 capitalize mt-1">
                  {currentUser.approvalStatus || 'pending'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Profile Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {currentUser.profileCompleted ? 'Complete' : 'In Progress'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Expertise Areas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {currentUser.expertise?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Experience</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {currentUser.experience || 0} years
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a 
              href="/mentors/sessions"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📅</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Session Requests</h3>
                  <p className="text-blue-100 text-sm">Manage student sessions</p>
                </div>
              </div>
            </a>

            <a 
              href="/mentors/community"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Community Forum</h3>
                  <p className="text-green-100 text-sm">Connect with others</p>
                </div>
              </div>
            </a>

            <a 
              href="/mentors/messages"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✉️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Messages</h3>
                  <p className="text-purple-100 text-sm">Personal messaging</p>
                </div>
              </div>
            </a>

            <a 
              href="/mentors/students"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Students</h3>
                  <p className="text-orange-100 text-sm">Student management</p>
                </div>
              </div>
            </a>

            <a 
              href="/mentors/profile"
              className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Profile</h3>
                  <p className="text-pink-100 text-sm">Edit your profile</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">✅</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Profile Approved</p>
                <p className="text-sm text-gray-600">Your mentor profile has been approved</p>
              </div>
              <div className="text-right ml-auto">
                <p className="text-sm text-gray-500">Just now</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">🎓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Expertise Added</p>
                <p className="text-sm text-gray-600">Added {currentUser.expertise?.length || 0} areas of expertise</p>
              </div>
              <div className="text-right ml-auto">
                <p className="text-sm text-gray-500">Recently</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">🚀</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Ready to Mentor</p>
                <p className="text-sm text-gray-600">You're all set to start mentoring students</p>
              </div>
              <div className="text-right ml-auto">
                <p className="text-sm text-gray-500">Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}