import { forwardRef, useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';

const PasswordInput = forwardRef(({ label, id, error, required, ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
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
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className="w-full bg-transparent border-b pb-2.5 pt-1 pr-8 text-sm outline-none transition-colors placeholder:opacity-25 focus:border-[var(--ring)]"
          style={{
            borderColor: error ? 'var(--color-danger-500)' : 'var(--border)',
            color: 'var(--text)',
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-0 top-1 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          tabIndex={-1}
        >
          {visible ? <EyeSlash size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-danger-500)' }}>
          {error}
        </p>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
