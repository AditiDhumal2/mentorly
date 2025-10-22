import Link from 'next/link';

export default function CTAButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
      <Link
        href="/students-auth/register"
        className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105"
      >
        <span className="relative z-10 flex items-center space-x-2">
          <span>🚀 Get Started Free</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>
      
      <Link
        href="/students-auth/login"
        className="group border-2 border-cyan-400/50 text-cyan-300 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-300 backdrop-blur-lg transform hover:scale-105"
      >
        <span className="flex items-center space-x-2">
          <span>🔑 Existing User?</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </Link>
    </div>
  );
}