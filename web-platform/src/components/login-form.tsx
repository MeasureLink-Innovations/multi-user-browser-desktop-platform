'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8 border border-gray-200 shadow-sm">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">Sign In</h1>
        <p className="text-sm text-gray-600 mb-6">Multi-User Browser Desktop Platform</p>
        <div className="w-full">
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="mt-4">
            <label
              className="mb-2 block text-sm font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>
        </div>
        <button
          className="mt-6 flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          disabled={isPending}
        >
          {isPending ? 'Logging in...' : 'Log in'}
        </button>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
          )}
        </div>
      </div>
    </form>
  );
}
