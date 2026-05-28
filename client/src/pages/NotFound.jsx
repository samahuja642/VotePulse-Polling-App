import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from '@phosphor-icons/react';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24 pt-12 text-center">
      {/* Oversized 404 */}
      <p
        className="select-none font-bold tracking-tight"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(6rem, 18vw, 12rem)',
          lineHeight: 1,
          color: 'var(--border)',
        }}
      >
        404
      </p>

      {/* Icon + message */}
      <Compass
        size={32}
        weight="duotone"
        className="mt-4"
        style={{ color: 'var(--text-tertiary)' }}
      />
      <h1 className="mt-4 text-lg font-semibold" style={{ color: 'var(--text)' }}>
        Page not found
      </h1>
      <p className="mt-2 max-w-xs text-sm" style={{ color: 'var(--text-secondary)' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold tracking-wide transition-colors"
          style={{ backgroundColor: 'var(--color-primary-400)', color: '#0d0b09' }}
        >
          <ArrowLeft size={14} /> Go home
        </Link>
        <Link
          to="/explore"
          className="inline-flex items-center gap-1 text-sm transition-colors hover:underline"
          style={{ color: 'var(--text-secondary)' }}
        >
          Browse polls
        </Link>
      </div>
    </div>
  );
}
