import { describe, it, expect } from 'vitest';
import { getHabitSlug } from '@/lib/slug';

describe('getHabitSlug', () => {
  it('returns lowercase hyphenated slug for a basic habit name', () => {
    expect(getHabitSlug('Drink Water')).toBe('drink-water');
    expect(getHabitSlug('Read Books')).toBe('read-books');
  });

  it('trims outer spaces and collapses repeated internal spaces', () => {
    expect(getHabitSlug('  Drink   Water  ')).toBe('drink-water');
    expect(getHabitSlug('  Morning   Run  ')).toBe('morning-run');
  });

  it('removes non alphanumeric characters except hyphens', () => {
    expect(getHabitSlug('Drink Water!')).toBe('drink-water');
    expect(getHabitSlug('Read&Write')).toBe('readwrite');
    expect(getHabitSlug('Habit #1')).toBe('habit-1');
    expect(getHabitSlug('already-hyphenated')).toBe('already-hyphenated');
  });
});
