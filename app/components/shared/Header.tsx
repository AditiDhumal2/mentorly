'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isWelcomePage = pathname === '/welcome';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/welcome" className="flex items-center space-x-3 group">
            {/* Logo Design */}
            <div className="relative">
              {/* Main Logo Container */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                {/* M Letter */}
                <div className="relative">
                  {/* M Shape */}
                  <div className="w-6 h-6 relative">
                    <div className="absolute left-0 top-0 w-1.5 h-6 bg-white rounded-tl rounded-bl"></div>
                    <div className="absolute left-0 top-0 w-6 h-1.5 bg-white rounded-tl rounded-tr"></div>
                    <div className="absolute right-0 top-0 w-1.5 h-6 bg-white rounded-tr rounded-br"></div>
                    <div className="absolute left-2.5 top-0 w-1.5 h-4 bg-white transform -skew-x-12"></div>
                  </div>
                  
                  {/* Sparkle Effect */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-blue-200 rounded-full"></div>
                </div>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-blue-400 rounded-xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
            </div>
            
            {/* Brand Name */}
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mentorly
              </span>
              <span className="text-xs text-gray-500 -mt-1 hidden sm:block">
                Your Career Companion
              </span>
            </div>
          </Link>

          {/* Navigation - Only show on non-welcome pages */}
          {!isWelcomePage && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Dashboard
              </Link>
              <Link 
                href="/roadmap" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Roadmaps
              </Link>
              <Link 
                href="/career-domains" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Careers
              </Link>
              <Link 
                href="/resources" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Resources
              </Link>
            </nav>
          )}

          {/* Auth Buttons - Only show on welcome page */}
          {isWelcomePage && (
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* User Menu Placeholder - For logged-in users on other pages */}
          {!isWelcomePage && (
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                U
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}