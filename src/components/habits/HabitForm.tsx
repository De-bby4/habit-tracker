'use client';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getHabits, saveHabits } from '@/lib/storage';
import { validateHabitName } from '@/lib/validators';
import type { Habit } from '@/types/habit';

interface HabitFormProps {
  userId: string;
  habit?: Habit | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function HabitForm({ userId, habit, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateHabitName(name);
    if (!validation.valid) {
      setNameError(validation.error ?? '');
      return;
    }
    setNameError('');
    const all = getHabits();
    if (habit) {
      const updated: Habit = {
        ...habit,
        name: validation.value,
        description: description.trim(),
      };
      saveHabits(all.map(h => h.id === habit.id ? updated : h));
    } else {
      const newHabit: Habit = {
        id: uuidv4(),
        userId,
        name: validation.value,
        description: description.trim(),
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: [],
      };
      saveHabits([...all, newHabit]);
    }
    onSave();
  };

  return (
    <form
      data-testid="habit-form"
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4"
    >
      <h3 className="font-semibold text-gray-800">{habit ? 'Edit Habit' : 'New Habit'}</h3>

      <div>
        <label htmlFor="habit-name-input" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="habit-name-input"
          data-testid="habit-name-input"
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setNameError(''); }}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${nameError ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="e.g. Drink Water"
        />
        {nameError && (
          <p role="alert" className="text-red-500 text-xs mt-1">{nameError}</p>
        )}
      </div>

      <div>
        <label htmlFor="habit-description-input" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          id="habit-description-input"
          data-testid="habit-description-input"
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Optional description"
        />
      </div>

      <div>
        <label htmlFor="habit-frequency-select" className="block text-sm font-medium text-gray-700 mb-1">
          Frequency
        </label>
        <select
          id="habit-frequency-select"
          data-testid="habit-frequency-select"
          defaultValue="daily"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="daily">Daily</option>
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          data-testid="habit-save-button"
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {habit ? 'Save Changes' : 'Create Habit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
