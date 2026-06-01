import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';

// ─── Mock ───────────────────────────────────────────────────────────

let authState = { user: null, loading: false };

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => authState,
}));

const renderWithRoute = (initialRoute = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<p>Login Page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>Dashboard Content</p>} />
          <Route path="/polls/new" element={<p>Create Poll</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

// ─── Tests ──────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {
  it('redirects to /login when user is null', () => {
    authState = { user: null, loading: false };
    renderWithRoute('/dashboard');

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('renders child route when user is authenticated', () => {
    authState = { user: { id: '1', username: 'sam' }, loading: false };
    renderWithRoute('/dashboard');

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('shows spinner while loading', () => {
    authState = { user: null, loading: true };
    const { container } = renderWithRoute('/dashboard');

    // CircleNotch renders an SVG with animate-spin
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();

    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('protects all nested routes', () => {
    authState = { user: null, loading: false };
    renderWithRoute('/polls/new');

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Create Poll')).not.toBeInTheDocument();
  });

  it('grants access to nested routes when authenticated', () => {
    authState = { user: { id: '2', username: 'u' }, loading: false };
    renderWithRoute('/polls/new');

    expect(screen.getByText('Create Poll')).toBeInTheDocument();
  });
});
