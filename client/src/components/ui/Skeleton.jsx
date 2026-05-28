/**
 * Skeleton primitives for loading states.
 * Compose these to build page-specific skeleton screens.
 */

export function Bone({ className = '', style = {} }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ backgroundColor: 'var(--surface-hover)', ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <Bone className="h-4 w-3/5" />
        <Bone className="h-5 w-14 rounded-full" />
      </div>
      <Bone className="h-3 w-4/5" />
      <div className="flex items-center gap-4 pt-1">
        <Bone className="h-3 w-16" />
        <Bone className="h-3 w-20" />
        <Bone className="h-3 w-14" />
      </div>
    </div>
  );
}

export function PollDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Bone className="h-3 w-12" />

      {/* Header */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Bone className="h-5 w-16 rounded-full" />
          <Bone className="h-5 w-20 rounded-full" />
        </div>
        <Bone className="h-6 w-4/5" />
        <Bone className="h-3 w-3/5" />
        <div className="flex items-center gap-4 pt-1">
          <Bone className="h-3 w-24" />
          <Bone className="h-3 w-28" />
        </div>
      </div>

      {/* Options */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Bone key={i} className="h-11 w-full rounded-lg" />
        ))}
        <Bone className="h-10 w-full rounded-md mt-2" />
      </div>

      {/* Share card */}
      <Bone className="h-48 w-full rounded-xl" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl p-4 sm:p-5 space-y-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <Bone className="h-4 w-3/5" />
            <Bone className="h-5 w-14 rounded-full" />
          </div>
          <Bone className="h-3 w-2/3" />
          <div className="flex items-center gap-4">
            <Bone className="h-3 w-16" />
            <Bone className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-1.5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <Bone className="h-7 w-14 rounded-md" />
            <Bone className="h-7 w-14 rounded-md" />
            <Bone className="h-7 w-14 rounded-md" />
            <Bone className="h-7 w-16 rounded-md ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExploreGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
