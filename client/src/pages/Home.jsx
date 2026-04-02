export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <h1 className="text-5xl font-bold tracking-tight">
        Vote<span className="text-primary-500">Pulse</span>
      </h1>
      <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
        Create polls, share opinions, see results in real time.
      </p>
      <div className="flex gap-3">
        <a
          href="/register"
          className="rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white hover:bg-primary-700 transition-colors"
        >
          Get Started
        </a>
        <a
          href="/explore"
          className="rounded-lg px-6 py-2.5 font-medium transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          Explore Polls
        </a>
      </div>
    </div>
  );
}
