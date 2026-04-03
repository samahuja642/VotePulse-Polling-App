import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed',
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
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      style={
        variant === 'secondary'
          ? {
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }
          : undefined
      }
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {loading ? (loadingText || children) : children}
    </button>
  );
}
