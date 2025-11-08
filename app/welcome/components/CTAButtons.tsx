// app/welcome/components/CTAButtons.tsx
import Link from 'next/link';

export default function CTAButtons() {
  return (
    <div className="space-y-8">
      {/* Student CTA Section */}
      <div className="text-center">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">For Students</h3>
          <p className="text-gray-300 text-sm">
            Start your journey to career success with personalized guidance
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/students-auth/register"
            className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 min-w-[200px] text-center"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>🚀 Get Started Free</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          
          <Link
            href="/students-auth/login"
            className="group border-2 border-cyan-400/50 text-cyan-300 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-300 backdrop-blur-lg transform hover:scale-105 min-w-[200px] text-center"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>🔑 Student Login</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-gray-400 text-sm">or</span>
        </div>
      </div>

      {/* Mentor CTA Section */}
      <div className="text-center">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">For Mentors</h3>
          <p className="text-gray-300 text-sm">
            Share your expertise and guide the next generation of engineers
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/mentors-auth/register"
            className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 min-w-[200px] text-center"
          >
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>👨‍🏫 Become a Mentor</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          
          <Link
            href="/mentors-auth/login"
            className="group border-2 border-purple-400/50 text-purple-300 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-purple-400/10 hover:border-purple-400 transition-all duration-300 backdrop-blur-lg transform hover:scale-105 min-w-[200px] text-center"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>🔑 Mentor Login</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Quick Info */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-6 text-sm text-gray-400 bg-white/5 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>1000+ Students Guided</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span>50+ Expert Mentors</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>95% Success Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}