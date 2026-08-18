export function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-4 py-1.5 items-center">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-900 dark:text-slate-200 wrap-break-word">
        {value || "—"}
      </span>
    </div>
  );
}
