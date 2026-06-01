import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login.jsx';

// ─── Mocks ──────────────────────────────────────────────────────────

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: null, loading: false, login: mockLogin, logout: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../lib/api.js', () => ({
  default: { post: vi.fn() },
  setAccessToken: vi.fn(),
  setSessionExpiredHandler: vi.fn(),
  getAccessToken: vi.fn(),
}));

import api from '../lib/api.js';

beforeEach(() => {
  vi.clearAllMocks();
});

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );

// ─── Tests ──────────────────────────────────────────────────────────

describe('Login Page', () => {
  it('renders email and password fields with submit button', () => {
    renderLogin();

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows link to register page', () => {
    renderLogin();

    const link = screen.getByRole('link', { name: /create one/i });
    expect(link).toHaveAttribute('href', '/register');
  });

  it('shows validation errors for empty submit', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Your password'), 'short');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('calls API and navigates on successful login', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({
      data: { data: { user: { id: '1', username: 'sam' }, accessToken: 'tok' } },
    });

    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'sam@test.com');
    await user.type(screen.getByPlaceholderText('Your password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'sam@test.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith({ id: '1', username: 'sam' }, 'tok');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows root form error on 401', async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValue({
      response: {
        status: 401,
        data: { error: { message: 'Invalid email or password', code: 'UNAUTHORIZED' } },
      },
    });

    renderLogin();

    await user.type(screen.getByPlaceholderText('you@example.com'), 'wrong@test.com');
    await user.type(screen.getByPlaceholderText('Your password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // extractApiError maps UNAUTHORIZED → "Please log in to continue"
    await waitFor(() => {
      expect(screen.getByText(/please log in to continue/i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
