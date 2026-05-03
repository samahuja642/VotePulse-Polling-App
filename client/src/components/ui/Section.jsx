export default function Section({ heading, trailing, children }) {
  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {heading && (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {heading}
          </h2>
          {trailing}
        </div>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}
