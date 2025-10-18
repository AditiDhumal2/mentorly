'use client';

import { useSearchParams } from 'next/navigation';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  const searchParams = useSearchParams();

  const logoutMessage = searchParams.get('logout');
  const errorMessage = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your student account</p>
        </div>

        {/* Messages */}
        {logoutMessage === 'success' && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
            <p className="text-green-300 text-center">✅ Successfully logged out</p>
          </div>
        )}
        
        {errorMessage === 'unauthorized' && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-300 text-center">🔒 Please log in to access this page</p>
          </div>
        )}
        
        <LoginForm />
        
        {/* Security Notice */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            🔒 Secure authentication required
          </p>
        </div>
      </div>
    </div>
  ); 
}