export default function FormError({ message }) {
  if (!message) return null;

  return (
    <div
      className="mb-4 rounded-lg px-4 py-3 text-sm font-medium"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-danger-500) 12%, var(--surface))',
        color: 'var(--color-danger-600)',
        border: '1px solid color-mix(in srgb, var(--color-danger-500) 25%, var(--border))',
      }}
    >
      {message}
    </div>
  );
}
