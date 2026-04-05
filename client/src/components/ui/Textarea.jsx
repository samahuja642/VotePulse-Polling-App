import { forwardRef } from 'react';

const Textarea = forwardRef(({ label, id, error, required, rows = 3, ...props }, ref) => (
  <div>
    {label && (
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
        {required === true && <span className="text-red-500"> *</span>}
        {required === false && <span className="font-normal opacity-60"> (optional)</span>}
      </label>
    )}
    <textarea
      id={id}
      ref={ref}
      rows={rows}
      className="w-full resize-none rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:opacity-40 focus:ring-2 focus:ring-[var(--ring)]"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: `1px solid ${error ? 'var(--color-danger-400)' : 'var(--border)'}`,
        color: 'var(--text)',
      }}
      {...props}
    />
    {error && (
      <p className="mt-1 text-xs" style={{ color: 'var(--color-danger-500)' }}>
        {error}
      </p>
    )}
  </div>
));

Textarea.displayName = 'Textarea';
export default Textarea;
