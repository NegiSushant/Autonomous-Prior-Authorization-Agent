interface InvestigationRunnerProps {
  loading: boolean;
  onRun: () => void;
}

export default function InvestigationRunner({
  loading,
  onRun,
}: InvestigationRunnerProps) {
  return (
    <div className="mb-8 flex items-center">
      <button
        type="button"
        onClick={onRun}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && (
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />

            <path
              className="opacity-90"
              fill="currentColor"
              d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"
            />
          </svg>
        )}

        {loading ? "Running Investigation..." : "Run Investigation"}
      </button>
    </div>
  );
}
