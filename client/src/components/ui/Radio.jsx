import { forwardRef } from 'react';

const Radio = forwardRef(({ label, description, ...props }, ref) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="radio"
      ref={ref}
      className="h-4 w-4 shrink-0 accent-primary-600"
      {...props}
    />
    <div>
      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
        {label}
      </span>
      {description && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {description}
        </p>
      )}
    </div>
  </label>
));

Radio.displayName = 'Radio';
export default Radio;
