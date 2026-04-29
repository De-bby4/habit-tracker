import type { Habit } from '@/types/habit';

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const completions = [...habit.completions];
  const idx = completions.indexOf(date);
  if (idx === -1) {
    completions.push(date);
  } else {
    completions.splice(idx, 1);
  }
  return { ...habit, completions: [...new Set(completions)] };
}
