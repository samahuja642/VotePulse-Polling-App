import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CircleNotch,
  Plus,
  Eye,
  LockSimple,
  LockSimpleOpen,
  Trash,
  ChartBar,
  Clock,
  Users,
  LinkSimple,
  WarningCircle,
  ArrowClockwise,
  Warning,
  MagnifyingGlass,
  Check,
} from '@phosphor-icons/react';
import useDashboard from '../hooks/useDashboard.js';
import { DashboardSkeleton } from '../components/ui/Skeleton.jsx';

/* ── Confirmation Modal ── */

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-xl p-6 space-y-4"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start gap-3">
          <Warning size={20} weight="fill" style={{ color: 'var(--color-danger-500)' }} className="mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--color-danger-600)', color: '#fff' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

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
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0"
      style={{ color, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}

/* ── Poll Card ── */

function PollCard({ poll, actionLoading, onToggle, onDelete }) {
  const isLoading = actionLoading === poll.id;
  const [copied, setCopied] = useState(false);
  const timeAgo = new Date(poll.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const copyLink = () => {
    const url = `${window.location.origin}/polls/${poll.id}`;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
      },
      () => toast.error('Failed to copy link'),
    );
  };

  return (
    <div
      className="rounded-xl p-4 sm:p-5 transition-colors"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <Link
          to={`/polls/${poll.id}`}
          className="text-sm font-semibold hover:underline truncate min-w-0"
          style={{ color: 'var(--text)' }}
        >
          {poll.title}
        </Link>
        <StatusBadge status={poll.status} expiresAt={poll.expires_at} />
      </div>

      {poll.description && (
        <p className="mt-1.5 text-xs line-clamp-1" style={{ color: 'var(--text-tertiary)' }}>
          {poll.description}
        </p>
      )}

      {/* Stats row */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        <span className="inline-flex items-center gap-1">
          <Users size={12} />
          <span className="font-medium tabular-nums" style={{ color: 'var(--text-secondary)' }}>{poll.vote_count}</span>
          vote{poll.vote_count !== 1 ? 's' : ''}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} /> {timeAgo}
        </span>
        {poll.is_public && (
          <span className="inline-flex items-center gap-1">
            <Eye size={12} /> Public
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          to={`/polls/${poll.id}`}
          className="cursor-pointer inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-[var(--surface-hover)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChartBar size={12} /> View
        </Link>
        <button
          onClick={copyLink}
          disabled={isLoading}
          className="cursor-pointer inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {copied ? <Check size={12} weight="bold" /> : <LinkSimple size={12} />}
          {copied ? 'Copied' : 'Share'}
        </button>
        <button
          onClick={() => onToggle(poll.id, poll.status)}
          disabled={isLoading}
          className="cursor-pointer inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {poll.status === 'open' ? <LockSimple size={12} /> : <LockSimpleOpen size={12} />}
          {poll.status === 'open' ? 'Close' : 'Reopen'}
        </button>
        <button
          onClick={() => onDelete(poll.id)}
          disabled={isLoading}
          className="cursor-pointer inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
          style={{ color: 'var(--color-danger-500)' }}
        >
          <Trash size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

/* ── Dashboard Page ── */

export default function Dashboard() {
  const {
    polls,
    loading,
    loadingMore,
    error,
    search,
    hasMore,
    actionLoading,
    handleSearch,
    sentinelRef,
    toggleStatus,
    deletePoll,
    retry,
  } = useDashboard();

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deletePoll(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-1 justify-center py-8 px-4">
      <div className="w-full max-w-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            My Polls
          </h1>
          <Link
            to="/polls/new"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-semibold tracking-wide transition-colors"
            style={{ backgroundColor: 'var(--color-primary-400)', color: '#0d0b09' }}
          >
            <Plus size={14} weight="bold" /> New Poll
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-tertiary)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search your polls..."
            className="w-full rounded-md py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--ring)]"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
        </div>

        {/* Loading (initial) */}
        {loading && <DashboardSkeleton />}

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
            <ChartBar size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {search ? 'No polls match your search.' : "You haven't created any polls yet."}
            </p>
            {!search && (
              <Link
                to="/polls/new"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--color-primary-400)' }}
              >
                Create your first poll <Plus size={13} />
              </Link>
            )}
          </div>
        )}

        {/* Poll list */}
        {!loading && !error && polls.length > 0 && (
          <div className="space-y-3">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                actionLoading={actionLoading}
                onToggle={toggleStatus}
                onDelete={setDeleteTarget}
              />
            ))}

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex items-center justify-center py-4">
                <CircleNotch
                  size={20}
                  className="animate-spin"
                  style={{ color: 'var(--color-primary-400)', opacity: loadingMore ? 1 : 0 }}
                />
              </div>
            )}

            {!hasMore && polls.length > 10 && (
              <p className="text-center text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>
                You've reached the end.
              </p>
            )}
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteTarget && (
          <ConfirmModal
            title="Delete poll"
            message="This action cannot be undone. All votes and results will be permanently removed."
            confirmLabel="Delete"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </div>
    </div>
  );
}
