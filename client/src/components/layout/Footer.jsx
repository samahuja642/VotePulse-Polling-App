import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="mt-auto py-5"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        <p
          className="text-xs tracking-wide"
          style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
        >
          © {new Date().getFullYear()} VotePulse
        </p>
        <div className="flex gap-5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <Link to="/explore" className="hover:opacity-100 transition-opacity opacity-70">
            Explore
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-100 transition-opacity opacity-70"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
