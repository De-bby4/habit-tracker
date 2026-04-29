import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import HabitForm from '@/components/habits/HabitForm';
import HabitCard from '@/components/habits/HabitCard';
import { getHabits, saveHabits } from '@/lib/storage';
import type { Habit } from '@/types/habit';

const TODAY = new Date().toISOString().split('T')[0];

const mockHabit: Habit = {
  id: 'habit-123',
  userId: 'user-1',
  name: 'Drink Water',
  description: 'Stay hydrated',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
};

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup();
    render(<HabitForm userId="user-1" onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByTestId('habit-save-button'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Habit name is required');
  });

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<HabitForm userId="user-1" onSave={onSave} onCancel={vi.fn()} />);

    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water');
    await user.type(screen.getByTestId('habit-description-input'), 'Stay hydrated');
    await user.click(screen.getByTestId('habit-save-button'));

    const habits = getHabits();
    expect(habits).toHaveLength(1);
    expect(habits[0].name).toBe('Drink Water');
    expect(habits[0].userId).toBe('user-1');
    expect(habits[0].frequency).toBe('daily');
    expect(onSave).toHaveBeenCalled();
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup();
    saveHabits([mockHabit]);
    const onSave = vi.fn();
    render(<HabitForm userId="user-1" habit={mockHabit} onSave={onSave} onCancel={vi.fn()} />);

    const nameInput = screen.getByTestId('habit-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Drink More Water');
    await user.click(screen.getByTestId('habit-save-button'));

    const habits = getHabits();
    const updated = habits.find(h => h.id === mockHabit.id);
    expect(updated?.name).toBe('Drink More Water');
    expect(updated?.id).toBe(mockHabit.id);
    expect(updated?.userId).toBe(mockHabit.userId);
    expect(updated?.createdAt).toBe(mockHabit.createdAt);
    expect(updated?.completions).toEqual(mockHabit.completions);
    expect(onSave).toHaveBeenCalled();
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <HabitCard
        habit={mockHabit}
        today={TODAY}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    // Click delete button
    await user.click(screen.getByTestId('habit-delete-drink-water'));
    // confirm button should now be visible
    expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();
    // onDelete should NOT have been called yet
    expect(onDelete).not.toHaveBeenCalled();
    // Now confirm
    await user.click(screen.getByTestId('confirm-delete-button'));
    expect(onDelete).toHaveBeenCalledWith(mockHabit.id);
  });

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn((habit: Habit) => habit);
    const { rerender } = render(
      <HabitCard
        habit={mockHabit}
        today={TODAY}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('0 days streak');

    await user.click(screen.getByTestId('habit-complete-drink-water'));
    expect(onToggle).toHaveBeenCalledWith(mockHabit);

    // Re-render with completed habit to verify streak updates
    const completedHabit = { ...mockHabit, completions: [TODAY] };
    rerender(
      <HabitCard
        habit={completedHabit}
        today={TODAY}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('1 day streak');
  });
});
