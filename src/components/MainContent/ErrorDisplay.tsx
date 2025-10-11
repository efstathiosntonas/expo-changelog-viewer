import { useChangelogContext } from '@/hooks/useChangelogContext';

export function ErrorDisplay() {
  const { errors } = useChangelogContext();

  if (errors.length === 0) return null;

  return (
    <div
      aria-atomic="true"
      aria-live="assertive"
      className="mb-8 p-4 bg-red-50 dark:bg-red-950 border-l-4 border-red-500 rounded-r-lg"
      role="alert"
    >
      <div className="font-semibold text-red-900 dark:text-red-400 mb-2">
        Failed to load {errors.length} module{errors.length !== 1 ? 's' : ''}
      </div>
      <ul
        aria-label="List of failed modules"
        className="text-sm text-red-800 dark:text-red-300 space-y-1"
      >
        {errors.map((err, i) => (
          <li key={i}>• {err}</li>
        ))}
      </ul>
    </div>
  );
}
