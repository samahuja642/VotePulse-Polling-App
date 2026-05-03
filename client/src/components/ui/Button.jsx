import { CircleNotch } from '@phosphor-icons/react';

const variants = {
  primary:
    'bg-primary-400 text-[#0d0b09] hover:bg-primary-300 disabled:opacity-40 disabled:cursor-not-allowed font-semibold',
  secondary:
    'hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed',
};

export default function Button({
  children,
  icon: Icon,
  loading,
  loadingText,
  variant = 'primary',
  className = '',
  ...props
}) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-sm tracking-wide transition-colors ${variants[variant]} ${className}`}
      style={
        variant === 'secondary'
          ? {
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }
          : undefined
      }
      {...props}
    >
      {loading ? (
        <CircleNotch size={15} className="animate-spin" />
      ) : Icon ? (
        <Icon size={15} />
      ) : null}
      {loading ? (loadingText || children) : children}
    </button>
  );
}
