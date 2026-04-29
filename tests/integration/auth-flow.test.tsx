import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import SignupForm from '@/components/auth/SignupForm';
import LoginForm from '@/components/auth/LoginForm';
import { getSession, getUsers, saveUsers, saveSession } from '@/lib/storage';

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
  });

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'test@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe('test@example.com');
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for duplicate signup email', async () => {
    const user = userEvent.setup();
    saveUsers([{
      id: 'existing-id',
      email: 'test@example.com',
      password: 'pass',
      createdAt: new Date().toISOString(),
    }]);

    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'test@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    expect(await screen.findByRole('alert')).toHaveTextContent('User already exists');
    expect(getSession()).toBeNull();
  });

  it('submits the login form and stores the active session', async () => {
    const user = userEvent.setup();
    saveUsers([{
      id: 'user-1',
      email: 'login@example.com',
      password: 'mypassword',
      createdAt: new Date().toISOString(),
    }]);

    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'login@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'mypassword');
    await user.click(screen.getByTestId('auth-login-submit'));

    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe('login@example.com');
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for invalid login credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'wrong@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'wrongpass');
    await user.click(screen.getByTestId('auth-login-submit'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(getSession()).toBeNull();
  });
});
