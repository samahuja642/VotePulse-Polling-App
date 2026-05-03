import { forwardRef } from 'react';

const Input = forwardRef(({ label, id, error, required, ...props }, ref) => (
  <div className="group">
    {label && (
      <label
        htmlFor={id}
        className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
        {required === true && <span style={{ color: 'var(--color-danger-500)' }}> *</span>}
        {required === false && (
          <span className="normal-case tracking-normal font-normal opacity-50"> · optional</span>
        )}
      </label>
    )}
    <input
      id={id}
      ref={ref}
      className="w-full bg-transparent border-b pb-2.5 pt-1 text-sm outline-none transition-colors placeholder:opacity-25 focus:border-[var(--ring)]"
      style={{
        borderColor: error ? 'var(--color-danger-500)' : 'var(--border)',
        color: 'var(--text)',
      }}
      {...props}
    />
    {error && (
      <p className="mt-1.5 text-xs" style={{ color: 'var(--color-danger-500)' }}>
        {error}
      </p>
    )}
  </div>
));

Input.displayName = 'Input';
export default Input;
