'use client';
import { useState } from 'react';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';
import type { Habit } from '@/types/habit';

interface HabitCardProps {
  habit: Habit;
  today: string;
  onToggle: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function HabitCard({ habit, today, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const slug = getHabitSlug(habit.name);
  const isCompleted = habit.completions.includes(today);
  const streak = calculateCurrentStreak(habit.completions, today);

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-800 truncate ${isCompleted ? 'line-through text-gray-400' : ''}`}>
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{habit.description}</p>
          )}
          <div className="flex items-center gap-1 mt-2">
            <span className="text-orange-500 text-sm">🔥</span>
            <span
              data-testid={`habit-streak-${slug}`}
              className="text-sm font-medium text-gray-600"
            >
              {streak} day{streak !== 1 ? 's' : ''} streak
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            data-testid={`habit-complete-${slug}`}
            onClick={() => onToggle(habit)}
            aria-label={isCompleted ? `Unmark ${habit.name} as complete` : `Mark ${habit.name} as complete`}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              isCompleted
                ? 'border-green-500 bg-green-500 text-white focus:ring-green-400'
                : 'border-gray-300 hover:border-indigo-400 focus:ring-indigo-400'
            }`}
          >
            {isCompleted ? '✓' : ''}
          </button>

          <button
            data-testid={`habit-edit-${slug}`}
            onClick={() => onEdit(habit)}
            aria-label={`Edit ${habit.name}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
          >
            ✏️
          </button>

          <button
            data-testid={`habit-delete-${slug}`}
            onClick={() => setShowConfirm(true)}
            aria-label={`Delete ${habit.name}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">Delete <strong>{habit.name}</strong>? This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              data-testid="confirm-delete-button"
              onClick={() => onDelete(habit.id)}
              className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
