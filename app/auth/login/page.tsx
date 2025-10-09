import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
      </div>

      <div className="max-w-md w-full space-y-8 z-10">
        {/* Header */}
        <div className="text-center">
          <Link href="/welcome" className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
              <div className="w-7 h-7 relative">
                <div className="absolute left-0 top-0 w-1.5 h-7 bg-white rounded-tl rounded-bl"></div>
                <div className="absolute left-0 top-0 w-7 h-1.5 bg-white rounded-tl rounded-tr"></div>
                <div className="absolute right-0 top-0 w-1.5 h-7 bg-white rounded-tr rounded-br"></div>
                <div className="absolute left-2.5 top-0 w-1.5 h-4 bg-white transform -skew-x-12"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">Mentorly</span>
              <span className="text-cyan-300 text-xs -mt-1">Career Success Partner</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-gray-300">Sign in to your account</p>
        </div>

        {/* Login Form Component */}
        <LoginForm />
      </div>
    </div>
  );
}