import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20">
      <h1 className="text-5xl font-bold tracking-tight">
        Vote<span className="text-primary-500">Pulse</span>
      </h1>
      <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
        Create polls, share opinions, see results in real time.
      </p>
      <div className="flex gap-3">
        <Link
          to="/register"
          className="rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white hover:bg-primary-700 transition-colors"
        >
          Get Started
        </Link>
        <Link
          to="/explore"
          className="rounded-lg px-6 py-2.5 font-medium transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          Explore Polls
        </Link>
      </div>
    </div>
  );
}
