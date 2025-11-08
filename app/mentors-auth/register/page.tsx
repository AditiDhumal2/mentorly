// app/mentors-auth/register/page.tsx
import MentorRegisterForm from './components/MentorRegisterForm';
import Link from 'next/link';

export default function MentorRegisterPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-150"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 px-4">
        <div className="container mx-auto">
          <Link href="/" className="inline-block">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 relative">
                  <div className="absolute left-0 top-0 w-1 h-6 bg-white rounded-tl rounded-bl"></div>
                  <div className="absolute left-0 top-0 w-6 h-1 bg-white rounded-tl rounded-tr"></div>
                  <div className="absolute right-0 top-0 w-1 h-6 bg-white rounded-tr rounded-br"></div>
                  <div className="absolute left-2 top-0 w-1 h-4 bg-white transform -skew-x-12"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mentorly</h1>
                <p className="text-pink-300 text-sm">Mentor Registration</p>
              </div>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center relative z-10 py-8 px-4">
        <div className="w-full max-w-4xl">
          <MentorRegisterForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4">
        <div className="container mx-auto text-center">
          <p className="text-gray-400 text-sm">
            Already have a mentor account?{' '}
            <Link href="/mentors-auth/login" className="text-pink-300 hover:text-pink-400 font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}