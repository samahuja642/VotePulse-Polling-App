import { Link, NavLink } from 'react-router-dom';
import { List, X } from '@phosphor-icons/react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const navLinks = [
  { to: '/explore', label: 'Explore' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg) 88%, transparent)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.15rem',
            letterSpacing: '-0.04em',
            color: 'var(--text)',
          }}
        >
          Vote<span style={{ color: 'var(--color-primary-400)' }}>Pulse</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 sm:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="text-sm transition-opacity"
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-primary-400)' : 'var(--text-secondary)',
                opacity: isActive ? 1 : undefined,
              })}
            >
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {user.username}
              </span>
              <Link
                to="/polls/new"
                className="rounded-sm px-4 py-1.5 text-sm font-semibold tracking-wide transition-colors hover:bg-primary-300"
                style={{ backgroundColor: 'var(--color-primary-400)', color: '#0d0b09' }}
              >
                New poll
              </Link>
              <button
                onClick={logout}
                className="text-sm transition-colors hover:opacity-100"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-sm px-4 py-1.5 text-sm font-semibold tracking-wide transition-colors hover:bg-primary-300"
              style={{ backgroundColor: 'var(--color-primary-400)', color: '#0d0b09' }}
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-1.5 rounded transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <List size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="sm:hidden px-4 pb-5 pt-2 flex flex-col gap-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="text-sm"
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-primary-400)' : 'var(--text-secondary)',
              })}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <Link
                to="/polls/new"
                className="rounded-sm px-4 py-2 text-sm font-semibold tracking-wide text-center transition-colors"
                style={{ backgroundColor: 'var(--color-primary-400)', color: '#0d0b09' }}
                onClick={() => setMobileOpen(false)}
              >
                New poll
              </Link>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="text-sm text-center"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-sm px-4 py-2 text-sm font-semibold tracking-wide text-center transition-colors"
              style={{ backgroundColor: 'var(--color-primary-400)', color: '#0d0b09' }}
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
