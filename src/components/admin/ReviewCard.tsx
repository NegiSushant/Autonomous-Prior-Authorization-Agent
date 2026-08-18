import { Pencil } from "lucide-react";

export function ReviewCard({
  title,
  stepIndex,
  onEdit,
  hideEdit,
  children,
}: {
  title: string;
  stepIndex: number;
  onEdit: (i: number) => void;
  hideEdit?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm relative group transition-colors">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          {title}
        </h3>

        {!hideEdit && (
          <button
            onClick={() => onEdit(stepIndex)}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            title={`Edit ${title}`}
          >
            <Pencil size={14} /> Edit
          </button>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
