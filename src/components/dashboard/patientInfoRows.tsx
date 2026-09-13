export function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | boolean | undefined | null;
  icon?: React.ReactNode;
}) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
      <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 whitespace-nowrap">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-right font-medium text-gray-900 dark:text-slate-200 max-w-[60%] wrap-break-word">
        {String(value)}
      </div>
    </div>
  );
}
