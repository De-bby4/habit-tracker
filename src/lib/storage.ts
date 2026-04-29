import type { User, Session } from '@/types/auth';
import type { Habit } from '@/types/habit';

const USERS_KEY = 'habit-tracker-users';
const SESSION_KEY = 'habit-tracker-session';
const HABITS_KEY = 'habit-tracker-habits';

// Users
export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); }
  catch { return []; }
}
export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Session
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'); }
  catch { return null; }
}
export function saveSession(session: Session | null): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
export function clearSession(): void {
  localStorage.setItem(SESSION_KEY, 'null');
}

// Habits
export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(HABITS_KEY) ?? '[]'); }
  catch { return []; }
}
export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}
export function getHabitsForUser(userId: string): Habit[] {
  return getHabits().filter(h => h.userId === userId);
}
