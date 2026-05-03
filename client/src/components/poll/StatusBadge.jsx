import { Clock, Lock, CheckCircle } from '@phosphor-icons/react';

const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium';

function badge(color) {
  return {
    backgroundColor: `color-mix(in srgb, var(--color-${color}-500) 12%, var(--surface))`,
    color: `var(--color-${color}-600)`,
  };
}

export default function StatusBadge({ isClosed, isExpired }) {
  if (isClosed) {
    return (
      <span className={base} style={badge('danger')}>
        <Lock size={12} /> Closed
      </span>
    );
  }
  if (isExpired) {
    return (
      <span className={base} style={badge('warning')}>
        <Clock size={12} /> Expired
      </span>
    );
  }
  return (
    <span className={base} style={badge('success')}>
      <CheckCircle size={12} /> Open
    </span>
  );
}
