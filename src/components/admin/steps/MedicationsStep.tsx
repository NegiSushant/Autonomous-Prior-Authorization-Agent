import { Plus, Trash2 } from "lucide-react";
import { Field } from "../Field";
import { inputClass } from "./constants";

// 1. Define the shape of a single Medication record
export type MedicationItem = {
  id?: string;
  patientId?: number;
  documentId: string;
  drugName: string;
  category: string;
  recordDate: string;
  status: string;
};

// 2. Replace 'any[]' with 'MedicationItem[]'
type Props = {
  medications: MedicationItem[];
  onChange: (index: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  mode?: "create" | "view" | "edit";
};

export default function MedicationsStep({
  medications,
  onChange,
  onAdd,
  onRemove,
  mode = "create",
}: Props) {
  return (
    <>
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold">3. Pharmacy Record</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Inject medication history for this patient.
        </p>
      </div>

      <div className="space-y-6">
        {/* TypeScript automatically knows 'med' is of type 'MedicationItem' now */}
        {medications.map((med, index) => (
          <div
            key={index}
            className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5 pt-8"
          >
            {medications.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="Remove Entry"
              >
                <Trash2 size={18} />
              </button>
            )}
            <h3 className="absolute top-0 left-0 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-tl-xl rounded-br-xl">
              Medication #{index + 1}
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              {mode !== "create" && (
                <Field label="Patient ID" htmlFor={`med-pid-${index}`}>
                  <input
                    id={`med-pid-${index}`}
                    value={med.patientId}
                    className={`${inputClass} opacity-80 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50`}
                    readOnly
                  />
                </Field>
              )}
              <Field label="Document ID" htmlFor={`med-docid-${index}`}>
                <input
                  id={`med-docid-${index}`}
                  value={med.documentId}
                  onChange={(e) =>
                    onChange(index, "documentId", e.target.value)
                  }
                  placeholder="RX-PAT006-001"
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Drug Name" htmlFor={`med-name-${index}`}>
                <input
                  id={`med-name-${index}`}
                  value={med.drugName}
                  onChange={(e) => onChange(index, "drugName", e.target.value)}
                  placeholder="Ibuprofen 400mg"
                  className={inputClass}
                  required
                />
              </Field>
              <Field
                label="Category"
                htmlFor={`med-category-${index}`}
                hint="e.g., NSAID, Analgesic"
              >
                <input
                  id={`med-category-${index}`}
                  value={med.category}
                  onChange={(e) => onChange(index, "category", e.target.value)}
                  placeholder="NSAID"
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Record Date" htmlFor={`med-date-${index}`}>
                <input
                  id={`med-date-${index}`}
                  value={med.recordDate}
                  onChange={(e) =>
                    onChange(index, "recordDate", e.target.value)
                  }
                  type="date"
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Status" htmlFor={`med-status-${index}`}>
                <select
                  id={`med-status-${index}`}
                  value={med.status}
                  onChange={(e) => onChange(index, "status", e.target.value)}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="stopped">Stopped</option>
                </select>
              </Field>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors py-2"
        >
          <Plus size={16} /> Add Another Medication
        </button>
      </div>
    </>
  );
}
