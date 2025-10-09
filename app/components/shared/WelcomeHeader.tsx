import Link from 'next/link';

export default function WelcomeHeader() {
  return (
    <header className="bg-transparent absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <Link href="/welcome" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl group-hover:shadow-cyan-500/25 transition-all duration-300 group-hover:scale-105">
                <div className="w-7 h-7 relative">
                  <div className="absolute left-0 top-0 w-1.5 h-7 bg-white rounded-tl rounded-bl"></div>
                  <div className="absolute left-0 top-0 w-7 h-1.5 bg-white rounded-tl rounded-tr"></div>
                  <div className="absolute right-0 top-0 w-1.5 h-7 bg-white rounded-tr rounded-br"></div>
                  <div className="absolute left-2.5 top-0 w-1.5 h-4 bg-white transform -skew-x-12"></div>
                </div>
              </div>
            </div>
            
            {/* Brand Name */}
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white drop-shadow-lg">
                Mentorly
              </span>
              <span className="text-cyan-300 text-xs -mt-1 hidden sm:block">
                Career Success Partner
              </span>
            </div>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-white/90 hover:text-white font-medium transition-all duration-200 text-sm backdrop-blur-lg bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20 border border-white/20 hover:border-white/30"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 text-sm shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}