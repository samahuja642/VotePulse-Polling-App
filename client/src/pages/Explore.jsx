import { Link } from 'react-router-dom';
import {
  CircleNotch,
  MagnifyingGlass,
  SortAscending,
  Users,
  Clock,
  ChartBar,
  User,
  WarningCircle,
  ArrowClockwise,
  Compass,
} from '@phosphor-icons/react';
import useExplore from '../hooks/useExplore.js';

/* ── Sort Options ── */

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most_voted', label: 'Most voted' },
];

/* ── Status Badge ── */

function StatusBadge({ status, expiresAt }) {
  const isExpired = expiresAt && new Date(expiresAt) <= new Date();
  const label = isExpired ? 'Expired' : status === 'open' ? 'Open' : 'Closed';
  const color = isExpired
    ? 'var(--color-warning-600)'
    : status === 'open'
      ? 'var(--color-success-600)'
      : 'var(--color-danger-600)';
  const bg = isExpired
    ? 'color-mix(in srgb, var(--color-warning-500) 12%, var(--surface))'
    : status === 'open'
      ? 'color-mix(in srgb, var(--color-success-500) 12%, var(--surface))'
      : 'color-mix(in srgb, var(--color-danger-500) 12%, var(--surface))';

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}

/* ── Poll Card ── */

function PollCard({ poll }) {
  const timeAgo = new Date(poll.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/polls/${poll.id}`}
      className="group block rounded-xl p-5 space-y-3 transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-sm font-semibold group-hover:underline truncate"
          style={{ color: 'var(--text)' }}
        >
          {poll.title}
        </h3>
        <StatusBadge status={poll.status} expiresAt={poll.expires_at} />
      </div>

      {/* Description */}
      {poll.description && (
        <p className="text-xs line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
          {poll.description}
        </p>
      )}

      {/* Meta */}
      <div
        className="flex flex-wrap items-center gap-3 text-[11px]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span className="inline-flex items-center gap-1">
          <User size={12} /> {poll.creator_username}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users size={12} /> {poll.vote_count} vote{poll.vote_count !== 1 ? 's' : ''}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} /> {timeAgo}
        </span>
      </div>
    </Link>
  );
}

/* ── Pagination ── */

function Pagination({ pagination, page, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        Previous
      </button>
      <span className="text-xs tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
        {page} / {pagination.pages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pagination.pages}
        className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        Next
      </button>
    </div>
  );
}

/* ── Explore Page ── */

export default function Explore() {
  const {
    polls,
    pagination,
    page,
    sort,
    search,
    loading,
    error,
    setPage,
    handleSort,
    handleSearch,
    retry,
  } = useExplore();

  return (
    <div className="flex flex-1 justify-center py-8 px-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Explore Polls
          </h1>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Discover and vote on public polls from the community.
          </p>
        </div>

        {/* Search & Sort bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlass
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search polls..."
              className="w-full rounded-md py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--ring)]"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <SortAscending
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              className="cursor-pointer appearance-none rounded-md py-2 pl-9 pr-8 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--ring)]"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <CircleNotch size={32} className="animate-spin" style={{ color: 'var(--color-primary-400)' }} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="rounded-xl p-10 text-center space-y-3"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <WarningCircle size={36} weight="fill" style={{ color: 'var(--color-danger-500)', margin: '0 auto' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button
              onClick={retry}
              className="cursor-pointer inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: 'var(--color-primary-400)' }}
            >
              <ArrowClockwise size={14} /> Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && polls.length === 0 && (
          <div
            className="rounded-xl p-10 text-center space-y-3"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Compass size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {search ? 'No polls match your search.' : 'No public polls yet.'}
            </p>
          </div>
        )}

        {/* Poll grid */}
        {!loading && !error && polls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <Pagination pagination={pagination} page={page} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
