'use client';

import { useActionState } from 'react';
import { registerUser } from './actions';

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerUser, { error: '' });

  return (
    <form action={formAction} className="mt-8 space-y-6 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      {/* Error Message */}
      {state?.error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={isPending}
            className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            placeholder="Enter your full name"
          />
        </div>

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
            minLength={6}
            disabled={isPending}
            className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            placeholder="Create a password (min. 6 characters)"
          />
        </div>

        {/* Year Field */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-300">
            Current Year
          </label>
          <select
            id="year"
            name="year"
            required
            disabled={isPending}
            className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
          >
            <option value="" className="bg-gray-800">Select your year</option>
            <option value="1" className="bg-gray-800">1st Year</option>
            <option value="2" className="bg-gray-800">2nd Year</option>
            <option value="3" className="bg-gray-800">3rd Year</option>
            <option value="4" className="bg-gray-800">4th Year</option>
          </select>
        </div>

        {/* College Field */}
        <div>
          <label htmlFor="college" className="block text-sm font-medium text-gray-300">
            College/University
          </label>
          <input
            id="college"
            name="college"
            type="text"
            required
            disabled={isPending}
            className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
            placeholder="Enter your college name"
          />
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
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Already have an account?{' '}
          <a href="/auth/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
            Sign in here
          </a>
        </p>
      </div>
    </form>
  );
}