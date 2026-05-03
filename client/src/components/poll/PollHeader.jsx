import { User, CalendarBlank, Clock } from '@phosphor-icons/react';
import StatusBadge from './StatusBadge.jsx';

export default function PollHeader({ poll, isOwner, isClosed, isExpired }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <StatusBadge isClosed={isClosed} isExpired={isExpired} />
        {isOwner && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary-500) 12%, var(--surface))',
              color: 'var(--color-primary-600)',
            }}
          >
            Your poll
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
        {poll.title}
      </h1>

      {poll.description && (
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {poll.description}
        </p>
      )}

      <div
        className="mt-3 flex flex-wrap items-center gap-4 text-xs"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span className="inline-flex items-center gap-1">
          <User size={12} /> {poll.creator_username}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarBlank size={12} /> {new Date(poll.created_at).toLocaleDateString()}
        </span>
        {poll.expires_at && (
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> Expires {new Date(poll.expires_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
