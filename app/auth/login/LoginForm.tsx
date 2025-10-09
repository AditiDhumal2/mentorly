'use client';

import { useActionState } from 'react';
import { loginUser } from './actions';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginUser, { error: '' });

  return (
    <form action={formAction} className="mt-8 space-y-6 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      {/* Error Message */}
      {state?.error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
          {state.error}
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
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={isPending}
            className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            placeholder="Enter your password"
          />
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