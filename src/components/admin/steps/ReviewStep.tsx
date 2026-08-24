import { Loader2, ArrowLeft } from "lucide-react";
import { ReviewCard } from "../ReviewCard";
import { ReviewItem } from "../ReviewItem";
import { InitialData } from "./constants";

type Props = {
  data: InitialData;
  mode: "create" | "view" | "edit";
  busy: boolean;
  onBack: () => void;
  onEdit: (index: number) => void;
  onSubmit: () => void;
};

export default function ReviewStep({
  data,
  mode,
  busy,
  onBack,
  onEdit,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold">Review Data</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verify all attached records below.
        </p>
      </div>

      <div className="space-y-6">
        <ReviewCard
          title="Patient Profile"
          stepIndex={0}
          onEdit={onEdit}
          hideEdit={mode === "view"}
        >
          {/* <ReviewItem label="Patient ID" value={data.patient.id} /> */}
          <ReviewItem
            label="Patient ID"
            value={
              data.patient.id != null
                ? `PAT${String(data.patient.id).padStart(3, "0")}`
                : "—"
            }
          />
          <ReviewItem label="Name" value={data.patient.name} />
          <ReviewItem label="Email" value={data.patient.email} />
          <ReviewItem label="Insurance" value={data.patient.insurancePayer} />
          <ReviewItem
            label="Procedure"
            value={`${data.patient.procedureName} (${data.patient.procedureCode})`}
          />
          <ReviewItem label="Diagnosis" value={data.patient.diagnosisCode} />
        </ReviewCard>

        {/* Removed ': any' because TypeScript now infers 'note' automatically */}
        {data.notes.map((note, idx) => (
          <ReviewCard
            key={note.id || idx}
            title={`Clinical Note ${data.notes.length > 1 ? `#${idx + 1}` : ""}`}
            stepIndex={1}
            onEdit={onEdit}
            hideEdit={mode === "view"}
          >
            <ReviewItem
              label="Patient ID"
              value={
                note.patientId != null
                  ? `PAT${String(data.patient.id).padStart(3, "0")}`
                  : "—"
              }
            />
            <ReviewItem label="Doc ID" value={note.documentId} />
            <ReviewItem label="Date" value={note.noteDate} />
            <div className="mt-2 grid grid-cols-[1fr_2fr] gap-4 py-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Body Text
              </span>
              <span className="text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-md leading-relaxed whitespace-pre-wrap">
                {note.bodyText || "—"}
              </span>
            </div>
          </ReviewCard>
        ))}

        {/* Removed ': any' */}
        {data.medications.map((med, idx) => (
          <ReviewCard
            key={med.id || idx}
            title={`Medication ${data.medications.length > 1 ? `#${idx + 1}` : ""}`}
            stepIndex={2}
            onEdit={onEdit}
            hideEdit={mode === "view"}
          >
            <ReviewItem
              label="Patient ID"
              value={
                med.patientId != null
                  ? `PAT${String(data.patient.id).padStart(3, "0")}`
                  : "—"
              }
            />
            <ReviewItem label="Drug Name" value={med.drugName} />
            <ReviewItem label="Category" value={med.category} />
            <ReviewItem label="Status" value={med.status} />
          </ReviewCard>
        ))}

        {/* Removed ': any' */}
        {data.imaging.map((img, idx) => (
          <ReviewCard
            key={img.id || idx}
            title={`Imaging ${data.imaging.length > 1 ? `#${idx + 1}` : ""}`}
            stepIndex={3}
            onEdit={onEdit}
            hideEdit={mode === "view"}
          >
            <ReviewItem
              label="Patient ID"
              value={
                data.patient.id != null
                  ? `PAT${String(data.patient.id).padStart(3, "0")}`
                  : "—"
              }
            />
            <ReviewItem label="Body Part" value={img.bodyPart} />
            <ReviewItem label="Date" value={img.reportDate} />
            <div className="mt-2 grid grid-cols-[1fr_2fr] gap-4 py-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Findings
              </span>
              <span className="text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-md leading-relaxed whitespace-pre-wrap">
                {img.findings || "—"}
              </span>
            </div>
          </ReviewCard>
        ))}
      </div>

      {/* Review Controls */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <button
          type="button"
          disabled={busy}
          onClick={mode === "view" ? () => window.history.back() : onBack}
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={busy || mode === "view"}
          className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all ${
            mode === "view"
              ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60"
              : "bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70"
          }`}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "view"
            ? "View Mode (Read Only)"
            : busy
              ? "Submitting..."
              : mode === "edit"
                ? "Save Changes"
                : "Submit All Records"}
        </button>
      </div>
    </div>
  );
}
