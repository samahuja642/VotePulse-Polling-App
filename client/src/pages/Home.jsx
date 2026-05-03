import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col justify-center px-2 pb-24 pt-12 sm:pt-20">
      <div className="max-w-6xl mx-auto w-full">

        {/* Eyebrow */}
        <p
          className="mb-8 text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: 'var(--color-primary-400)' }}
        >
          Real-time polling
        </p>

        {/* Display heading */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(3.2rem, 9vw, 8rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.035em',
            color: 'var(--text)',
          }}
        >
          The pulse of<br />
          <span style={{ color: 'var(--color-primary-400)' }}>collective</span><br />
          opinion.
        </h1>

        {/* Rule + subtitle */}
        <div className="mt-10 flex items-start gap-5">
          <div
            className="mt-2 h-px w-12 shrink-0"
            style={{ backgroundColor: 'var(--border)' }}
          />
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Create polls in seconds. Share them anywhere.
            Watch opinions converge in real time.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-sm px-6 py-3 text-sm font-semibold tracking-wide transition-colors"
            style={{ backgroundColor: 'var(--color-primary-400)', color: '#0d0b09' }}
          >
            Start polling <ArrowRight size={14} />
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Browse polls <ArrowRight size={13} className="opacity-60" />
          </Link>
        </div>

        {/* Bottom rule */}
        <div
          className="mt-20 h-px w-full opacity-30"
          style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary-500), transparent 60%)' }}
        />
      </div>
    </div>
  );
}
