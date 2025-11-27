// app/mentors/dashboard/components/WelcomeBanner.tsx
'use client';

import { mentorLogout } from '@/app/mentors-auth/login/actions/mentor-login.actions';
import { Mentor, DashboardStats } from '@/types';

interface WelcomeBannerProps {
  mentor: Mentor;
  stats: DashboardStats;
}

export default function WelcomeBanner({ mentor, stats }: WelcomeBannerProps) {
  const handleLogout = async () => {
    await mentorLogout();
    window.location.href = '/mentors-auth/login';
  };

  return (
    <>
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
            <p className="text-gray-600">Welcome back, {mentor.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                {mentor.profilePhoto ? (
                  <img 
                    src={mentor.profilePhoto} 
                    alt={mentor.name}
                    className="w-16 h-16 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white">
                    {mentor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {mentor.name}! 👋</h1>
                <p className="text-blue-100 text-lg">
                  {mentor.bio || "Ready to inspire and guide the next generation of students?"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-sm text-blue-100">Expertise</div>
                <div className="font-semibold">{mentor.expertise?.slice(0, 2).join(', ') || 'Not specified'}</div>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-sm text-blue-100">Member Since</div>
                <div className="font-semibold">{mentor.memberSince || '2024'}</div>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-sm text-blue-100">Status</div>
                <div className="font-semibold capitalize">{mentor.approvalStatus} {mentor.approvalStatus === 'approved' ? '✅' : '⏳'}</div>
              </div>
              {mentor.college && (
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <div className="text-sm text-blue-100">College</div>
                  <div className="font-semibold">{mentor.college}</div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 lg:mt-0 flex-shrink-0">
            <div className="bg-white/20 p-6 rounded-2xl text-center">
              <div className="text-2xl font-bold">{stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}</div>
              <div className="text-blue-100 text-sm">Average Rating</div>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= Math.floor(stats.rating) ? 'text-yellow-400' : 'text-blue-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}