'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, saveUsers, saveSession } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      setError('User already exists');
      return;
    }
    const newUser = {
      id: uuidv4(),
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    saveSession({ userId: newUser.id, email: newUser.email });
    router.replace('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">Create account</h2>

      {error && (
        <div role="alert" className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="auth-signup-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="auth-signup-email"
          data-testid="auth-signup-email"
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
        <label htmlFor="auth-signup-password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="auth-signup-password"
          data-testid="auth-signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="••••••••"
        />
      </div>

      <button
        data-testid="auth-signup-submit"
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Sign up
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
