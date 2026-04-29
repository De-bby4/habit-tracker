'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, saveSession } from '@/lib/storage';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      setError('Invalid email or password');
      return;
    }
    saveSession({ userId: user.id, email: user.email });
    router.replace('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">Welcome back</h2>

      {error && (
        <div role="alert" className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="auth-login-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="auth-login-email"
          data-testid="auth-login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="auth-login-password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="auth-login-password"
          data-testid="auth-login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="••••••••"
        />
      </div>

      <button
        data-testid="auth-login-submit"
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Log in
      </button>

      <p className="text-center text-sm text-gray-500">
        No account?{' '}
        <Link href="/signup" className="text-indigo-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
