export default function FormError({ message }) {
  if (!message) return null;

  return (
    <div
      className="mb-4 rounded-lg px-4 py-3 text-sm font-medium"
      style={{
        backgroundColor: 'var(--color-danger-50)',
        color: 'var(--color-danger-600)',
        border: '1px solid var(--color-danger-200)',
      }}
    >
      {message}
    </div>
  );
}
