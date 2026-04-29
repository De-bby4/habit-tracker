'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getHabitsForUser, saveHabits, getHabits } from '@/lib/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import type { Session } from '@/types/auth';
import type { Habit } from '@/types/habit';
import HabitCard from '@/components/habits/HabitCard';
import HabitForm from '@/components/habits/HabitForm';
import { clearSession } from '@/lib/storage';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/login'); return; }
    setSession(s);
    setHabits(getHabitsForUser(s.userId));
    setMounted(true);
  }, [router]);

  if (!mounted || !session) return null;

  const today = new Date().toISOString().split('T')[0];

  const handleToggle = (habit: Habit) => {
    const updated = toggleHabitCompletion(habit, today);
    const all = getHabits().map(h => h.id === updated.id ? updated : h);
    saveHabits(all);
    setHabits(getHabitsForUser(session.userId));
  };

  const handleDelete = (id: string) => {
    const all = getHabits().filter(h => h.id !== id);
    saveHabits(all);
    setHabits(getHabitsForUser(session.userId));
  };

  const handleSave = () => {
    setHabits(getHabitsForUser(session.userId));
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Habit Tracker</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80 hidden sm:block">{session.email}</span>
          <button
            data-testid="auth-logout-button"
            onClick={handleLogout}
            className="text-sm bg-white text-indigo-600 px-3 py-1 rounded-full font-semibold hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6" data-testid="dashboard-page">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">My Habits</h2>
          <button
            data-testid="create-habit-button"
            onClick={() => { setEditingHabit(null); setShowForm(true); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            + New Habit
          </button>
        </div>

        {showForm && (
          <div className="mb-6">
            <HabitForm
              userId={session.userId}
              habit={editingHabit}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingHabit(null); }}
            />
          </div>
        )}

        {habits.length === 0 && !showForm ? (
          <div
            data-testid="empty-state"
            className="text-center py-16 text-gray-400"
          >
            <p className="text-5xl mb-4">🌱</p>
            <p className="text-lg font-medium">No habits yet</p>
            <p className="text-sm mt-1">Click <strong>+ New Habit</strong> to get started</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {habits.map(habit => (
              <li key={habit.id}>
                <HabitCard
                  habit={habit}
                  today={today}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
