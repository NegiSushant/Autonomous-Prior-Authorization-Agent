import { Plus, Trash2 } from "lucide-react";
import { Field } from "../Field";
import { inputClass } from "./constants"; // Adjust import path as needed

// 1. Define the shape of a single Imaging record
export type ImagingItem = {
  id?: string;
  patientId?: number;
  documentId: string;
  bodyPart: string;
  findings: string;
  reportDate: string;
  sourceType?: string;
};

// 2. Replace 'any[]' with 'ImagingItem[]'
type Props = {
  imaging: ImagingItem[];
  onChange: (index: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  mode?: "create" | "view" | "edit";
};

export default function ImagingStep({
  imaging,
  onChange,
  onAdd,
  onRemove,
  mode = "create",
}: Props) {
  return (
    <>
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold">4. Imaging Report</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Inject radiology findings for this patient.
        </p>
      </div>

      <div className="space-y-6">
        {/* TypeScript automatically knows 'img' is of type 'ImagingItem' now */}
        {imaging.map((img, index) => (
          <div
            key={index}
            className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5 pt-8"
          >
            {imaging.length > 1 && (
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
              Imaging #{index + 1}
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              {mode !== "create" && (
                <Field label="Patient ID" htmlFor={`img-pid-${index}`}>
                  <input
                    id={`img-pid-${index}`}
                    value={img.patientId}
                    className={`${inputClass} opacity-80 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50`}
                    readOnly
                  />
                </Field>
              )}
              <Field label="Document ID" htmlFor={`img-docid-${index}`}>
                <input
                  id={`img-docid-${index}`}
                  value={img.documentId}
                  onChange={(e) =>
                    onChange(index, "documentId", e.target.value)
                  }
                  placeholder="IMG-PAT006-001"
                  className={inputClass}
                  required
                />
              </Field>
              <Field
                label="Body Part"
                htmlFor={`body-part-${index}`}
                hint='e.g. "Lumbar Spine"'
              >
                <input
                  id={`body-part-${index}`}
                  value={img.bodyPart}
                  onChange={(e) => onChange(index, "bodyPart", e.target.value)}
                  placeholder="Lumbar Spine"
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Report Date" htmlFor={`img-date-${index}`}>
                <input
                  id={`img-date-${index}`}
                  value={img.reportDate}
                  onChange={(e) =>
                    onChange(index, "reportDate", e.target.value)
                  }
                  type="date"
                  className={inputClass}
                  required
                />
              </Field>
              <div className="md:col-span-2">
                <Field
                  label="Findings / Report Text"
                  htmlFor={`findings-${index}`}
                >
                  <textarea
                    id={`findings-${index}`}
                    value={img.findings}
                    onChange={(e) =>
                      onChange(index, "findings", e.target.value)
                    }
                    rows={4}
                    placeholder="Lumbar X-ray completed. Mild degenerative changes."
                    className={inputClass}
                    required
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors py-2"
        >
          <Plus size={16} /> Add Another Imaging Report
        </button>
      </div>
    </>
  );
}
