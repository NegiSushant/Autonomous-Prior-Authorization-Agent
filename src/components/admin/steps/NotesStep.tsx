import { Plus, Trash2 } from "lucide-react";
import { Field } from "../Field";
import { inputClass } from "./constants";

// 1. Define the shape of a single Note
export type NoteItem = {
  id?: string;
  patientId?: number;
  documentId: string;
  noteDate: string;
  bodyText: string;
  sourceType?: string;
};

// 2. Define the exact props this component expects
type Props = {
  notes: NoteItem[];
  onChange: (index: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  mode?: "create" | "view" | "edit";
};

// 3. Replace 'any' with 'Props'
export default function NotesStep({
  notes,
  onChange,
  onAdd,
  onRemove,
  mode = "create",
}: Props) {
  return (
    <>
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold">2. Clinical Note (EHR)</h2>
      </div>

      <div className="space-y-6">
        {/* TypeScript automatically knows 'note' is of type 'NoteItem' now */}
        {notes.map((note, index) => (
          <div
            key={index}
            className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5 pt-8"
          >
            {notes.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 dark:text-red-400 transition-colors"
                title="Remove Entry"
              >
                <Trash2 size={18} />
              </button>
            )}
            <h3 className="absolute top-0 left-0 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-tl-xl rounded-br-xl">
              Note #{index + 1}
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              {mode !== "create" && (
                <Field label="Patient ID" htmlFor={`note-pid-${index}`}>
                  <input
                    id={`note-pid-${index}`}
                    value={note.patientId}
                    readOnly
                    className={`${inputClass} opacity-80 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50`}
                  />
                </Field>
              )}
              <Field label="Document ID" htmlFor={`note-docid-${index}`}>
                <input
                  id={`note-docid-${index}`}
                  value={note.documentId}
                  onChange={(e) =>
                    onChange(index, "documentId", e.target.value)
                  }
                  placeholder="EHR-PAT006-001"
                  className={inputClass}
                  required
                />
              </Field>
              <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
                <Field label="Note Date" htmlFor={`note-date-${index}`}>
                  <input
                    id={`note-date-${index}`}
                    value={note.noteDate}
                    onChange={(e) =>
                      onChange(index, "noteDate", e.target.value)
                    }
                    type="date"
                    className={inputClass}
                    required
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field
                  label="Note Text"
                  htmlFor={`note-body-${index}`}
                  hint="Enter the raw text of the physician's note."
                >
                  <textarea
                    id={`note-body-${index}`}
                    value={note.bodyText}
                    onChange={(e) =>
                      onChange(index, "bodyText", e.target.value)
                    }
                    rows={5}
                    placeholder="Patient completed 6 weeks of physical therapy..."
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
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors py-2"
        >
          <Plus size={16} /> Add Another Note
        </button>
      </div>
    </>
  );
}
