import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = forwardRef(({ label, id, error, required, ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
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
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className="w-full rounded-lg px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors placeholder:opacity-40 focus:ring-2 focus:ring-[var(--ring)]"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: `1px solid ${error ? 'var(--color-danger-400)' : 'var(--border)'}`,
            color: 'var(--text)',
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-danger-500)' }}>
          {error}
        </p>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
