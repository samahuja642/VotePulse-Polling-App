import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="mt-auto py-6"
      style={{ borderTop: '1px solid var(--border)', color: 'var(--text-tertiary)' }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 sm:flex-row sm:justify-between sm:px-6">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Vote<span className="text-primary-500">Pulse</span>
        </p>
        <div className="flex gap-4 text-sm">
          <Link to="/explore" className="hover:text-primary-500 transition-colors">
            Explore
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-500 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
