export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 flex flex-col justify-start">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
          {hint}
        </p>
      )}
    </div>
  );
}
