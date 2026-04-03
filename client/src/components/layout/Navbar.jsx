import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const navLinks = [
  { to: '/explore', label: 'Explore' },
  { to: '/dashboard', label: 'Dashboard' },
];

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive
      ? 'text-primary-600'
      : 'hover:text-primary-600'
  }`;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="text-lg font-bold tracking-tight">
          Vote<span className="text-primary-500">Pulse</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {user.username}
              </span>
              <Link
                to="/polls/new"
                className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                New Poll
              </Link>
              <button
                onClick={logout}
                className="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="sm:hidden px-4 pb-4 flex flex-col gap-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <Link
                to="/polls/new"
                className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white text-center hover:bg-primary-700 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                New Poll
              </Link>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="rounded-md px-4 py-1.5 text-sm font-medium text-center transition-colors"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white text-center hover:bg-primary-700 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
