'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { getSession } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (getSession()) router.replace('/dashboard');
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-8">Habit Tracker</h1>
        <LoginForm />
      </div>
    </main>
  );
}
