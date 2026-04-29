import { describe, it, expect } from 'vitest';
import { calculateCurrentStreak } from '@/lib/streaks';

/* MENTOR_TRACE_STAGE3_HABIT_A91 */

describe('calculateCurrentStreak', () => {
  it('returns 0 when completions is empty', () => {
    expect(calculateCurrentStreak([])).toBe(0);
  });

  it('returns 0 when today is not completed', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    expect(calculateCurrentStreak([yesterdayStr])).toBe(0);
  });

  it('returns the correct streak for consecutive completed days', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const todayStr = today.toISOString().split('T')[0];
    const yStr = yesterday.toISOString().split('T')[0];
    const twoStr = twoDaysAgo.toISOString().split('T')[0];

    expect(calculateCurrentStreak([todayStr, yStr, twoStr])).toBe(3);
    expect(calculateCurrentStreak([todayStr, yStr])).toBe(2);
    expect(calculateCurrentStreak([todayStr])).toBe(1);
  });

  it('ignores duplicate completion dates', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(calculateCurrentStreak([today, today, today])).toBe(1);
  });

  it('breaks the streak when a calendar day is missing', () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const todayStr = today.toISOString().split('T')[0];
    const twoStr = twoDaysAgo.toISOString().split('T')[0];

    // today is completed but yesterday is missing — streak should be 1
    expect(calculateCurrentStreak([todayStr, twoStr])).toBe(1);
  });
});
