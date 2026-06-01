import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Register.jsx';

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

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  );

// ─── Tests ──────────────────────────────────────────────────────────

describe('Register Page', () => {
  it('renders all four fields and submit button', () => {
    renderRegister();

    expect(screen.getByPlaceholderText('johndoe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min 8 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows link to login page', () => {
    renderRegister();

    const link = screen.getByRole('link', { name: /sign in/i });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('validates username min length', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText('johndoe'), 'ab');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('Min 8 characters'), 'password123');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('validates username allows only alphanumeric + underscore', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText('johndoe'), 'bad user!');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'a@b.com');
    await user.type(screen.getByPlaceholderText('Min 8 characters'), 'password123');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/letters, numbers, and underscores/i)).toBeInTheDocument();
    });
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText('johndoe'), 'testuser');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Min 8 characters'), 'password123');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'password456');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('calls API and navigates on successful registration', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({
      data: { data: { user: { id: '1', username: 'newuser' }, accessToken: 'tok' } },
    });

    renderRegister();

    await user.type(screen.getByPlaceholderText('johndoe'), 'newuser');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'new@test.com');
    await user.type(screen.getByPlaceholderText('Min 8 characters'), 'password123');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        username: 'newuser',
        email: 'new@test.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith({ id: '1', username: 'newuser' }, 'tok');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('strips confirmPassword before sending to API', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue({
      data: { data: { user: { id: '1', username: 'u' }, accessToken: 't' } },
    });

    renderRegister();

    await user.type(screen.getByPlaceholderText('johndoe'), 'testuser');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@t.com');
    await user.type(screen.getByPlaceholderText('Min 8 characters'), 'password123');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      const payload = api.post.mock.calls[0][1];
      expect(payload).not.toHaveProperty('confirmPassword');
    });
  });

  it('shows root error on 409 conflict', async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValue({
      response: {
        status: 409,
        data: { error: { message: 'Email or username already taken', code: 'CONFLICT' } },
      },
    });

    renderRegister();

    await user.type(screen.getByPlaceholderText('johndoe'), 'existing');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'dup@test.com');
    await user.type(screen.getByPlaceholderText('Min 8 characters'), 'password123');
    await user.type(screen.getByPlaceholderText('Re-enter your password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/already taken/i)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
