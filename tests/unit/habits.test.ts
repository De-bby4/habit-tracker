import { describe, it, expect } from 'vitest';
import { toggleHabitCompletion } from '@/lib/habits';
import type { Habit } from '@/types/habit';

const baseHabit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  name: 'Drink Water',
  description: '',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
};

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const result = toggleHabitCompletion(baseHabit, '2024-06-01');
    expect(result.completions).toContain('2024-06-01');
  });

  it('removes a completion date when the date already exists', () => {
    const habit = { ...baseHabit, completions: ['2024-06-01'] };
    const result = toggleHabitCompletion(habit, '2024-06-01');
    expect(result.completions).not.toContain('2024-06-01');
  });

  it('does not mutate the original habit object', () => {
    const habit = { ...baseHabit, completions: ['2024-06-01'] };
    const original = [...habit.completions];
    toggleHabitCompletion(habit, '2024-06-02');
    expect(habit.completions).toEqual(original);
  });

  it('does not return duplicate completion dates', () => {
    const habit = { ...baseHabit, completions: ['2024-06-01', '2024-06-01'] };
    const result = toggleHabitCompletion(habit, '2024-06-02');
    const count = result.completions.filter(d => d === '2024-06-01').length;
    expect(count).toBe(1);
  });
});
