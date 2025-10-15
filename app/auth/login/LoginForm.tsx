'use client';

import { useState } from 'react'
import { loginUser } from '@/actions/authActions';

export function LoginForm() {
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError('');
    
    try {
      console.log('🔍 LoginForm - Form submitted');
      const result = await loginUser(formData);
      
      // If we get a result with error, show it
      if (result?.error) {
        console.log('❌ LoginForm - Error from server:', result.error);
        setError(result.error);
      } else {
        console.log('✅ LoginForm - No error returned, redirect should happen');
      }
      
    } catch (error: any) {
      console.log('🔍 LoginForm - Caught error:', error);
      // Don't set error for redirects
      if (!error.digest?.startsWith('NEXT_REDIRECT')) {
        console.error('❌ LoginForm - Unexpected error:', error);
        setError('An unexpected error occurred');
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form action={handleSubmit} className="mt-8 space-y-6 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending}
            className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            placeholder="Enter your email"
            defaultValue="aditidhumal02@gmail.com"
          />
        </div>

        {/* Password Field with View Toggle */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isPending}
              className="block w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              placeholder="Enter your password"
              defaultValue="password123"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            disabled={isPending}
            className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-white/10 rounded bg-white/5 disabled:opacity-50"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
            Forgot your password?
          </a>
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isPending}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isPending ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign in to your account'
          )}
        </button>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Don't have an account?{' '}
          <a href="/auth/register" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
            Create one here
          </a>
        </p>
      </div>
    </form>
  );
}