import { forwardRef } from 'react';

const DateTimePicker = forwardRef(({ label, id, error, required, ...props }, ref) => (
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
    <input
      id={id}
      ref={ref}
      type="datetime-local"
      className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--ring)]"
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

DateTimePicker.displayName = 'DateTimePicker';
export default DateTimePicker;
