"use client";

import { useState } from "react";
import {
  UserPlus,
  FileText,
  Pill,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  ArrowLeft,
  Pencil,
} from "lucide-react";

type Message = { type: "success" | "error"; text: string };

const STEPS = [
  { id: "patient", title: "Patient Profile", icon: UserPlus },
  { id: "note", title: "Clinical Note", icon: FileText },
  { id: "medication", title: "Medication", icon: Pill },
  { id: "imaging", title: "Imaging", icon: ImageIcon },
  { id: "review", title: "Review", icon: CheckCircle2 },
];

export default function AdminClinicalDataPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);

  // Unified State for the entire wizard
  const [data, setData] = useState({
    patient: {
      patientId: "",
      name: "",
      insurancePayer: "",
      diagnosisCode: "",
      procedureCode: "",
      procedureName: "",
    },
    note: {
      patientId: "",
      documentId: "",
      noteDate: "",
      bodyText: "",
    },
    medication: {
      patientId: "",
      documentId: "",
      drugName: "",
      category: "",
      recordDate: "",
      status: "active",
    },
    imaging: {
      patientId: "",
      documentId: "",
      bodyPart: "",
      reportDate: "",
      findings: "",
    },
  });

  // Generic handler for all inputs
  const handleChange = (
    section: keyof typeof data,
    field: string,
    value: string,
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // Move to the next step
  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent native form submission

    // Auto-fill Patient ID into subsequent forms to save user time
    if (currentStep === 0 && data.patient.patientId) {
      setData((prev) => ({
        ...prev,
        note: {
          ...prev.note,
          patientId: prev.note.patientId || prev.patient.patientId,
        },
        medication: {
          ...prev.medication,
          patientId: prev.medication.patientId || prev.patient.patientId,
        },
        imaging: {
          ...prev.imaging,
          patientId: prev.imaging.patientId || prev.patient.patientId,
        },
      }));
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0); // scroll to top smoothly
    }
  };

  // Move to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Jump directly to a step (used by the Review page "Edit" buttons)
  const jumpToStep = (index: number) => {
    setCurrentStep(index);
    window.scrollTo(0, 0);
  };

  // Final Submit Handler
  const submitAllData = async () => {
    setBusy(true);
    setMessage(null);

    try {
      // Helper function to handle individual fetch calls
      const apiCall = async (url: string, body: Record<string, unknown>) => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json.message || `Failed at ${url}`);
      };

      // Execute all 4 saves sequentially
      await apiCall("/api/admin/patients", data.patient);
      await apiCall("/api/admin/notes", { ...data.note, sourceType: "EHR" });
      await apiCall("/api/admin/medications", data.medication);
      await apiCall("/api/admin/imaging", {
        ...data.imaging,
        sourceType: "Imaging",
      });

      setMessage({
        type: "success",
        text: "All clinical records securely injected into the database!",
      });

      // Reset form and go back to start
      setCurrentStep(0);
      setData({
        patient: {
          patientId: "",
          name: "",
          insurancePayer: "",
          diagnosisCode: "",
          procedureCode: "",
          procedureName: "",
        },
        note: { patientId: "", documentId: "", noteDate: "", bodyText: "" },
        medication: {
          patientId: "",
          documentId: "",
          drugName: "",
          category: "",
          recordDate: "",
          status: "active",
        },
        imaging: {
          patientId: "",
          documentId: "",
          bodyPart: "",
          reportDate: "",
          findings: "",
        },
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "A network error occurred during submission.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-8 text-slate-900 dark:text-white transition-colors duration-200">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Patient Information and their Clinical Data Setup
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Create patients and sequentially inject supporting clinical evidence
          into the system.
        </p>
      </div>

      {/* ─── Alert Banner ─────────────────────────────────────────────────── */}
      {message && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm animate-in fade-in slide-in-from-top-2 ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
          ) : (
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
          )}
          <div className="flex-1 text-sm font-medium">{message.text}</div>
          <button
            onClick={() => setMessage(null)}
            className="shrink-0 rounded-lg p-1 opacity-70 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─── Stepper Progress Bar ─────────────────────────────────────────── */}
      <div className="relative flex justify-between items-center px-2">
        <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full bg-slate-200 dark:bg-slate-800 -translate-y-1/2"></div>
        <div
          className="absolute left-0 top-1/2 -z-10 h-0.5 bg-blue-600 transition-all duration-500 -translate-y-1/2"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>

        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? "border-blue-600 bg-white text-blue-600 dark:bg-slate-900 dark:text-blue-400"
                    : isCompleted
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                      : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600"
                }`}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
              </div>
              <span
                className={`hidden sm:block text-xs font-semibold ${
                  isActive || isCompleted
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-400 dark:text-slate-600"
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* ─── Forms Container ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {currentStep < 4 ? (
          <form
            onSubmit={handleNext}
            className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {/* 1. PATIENT FORM */}
            {currentStep === 0 && (
              <>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-bold">1. Patient Profile</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Register the primary patient details first.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label="Patient ID"
                    htmlFor="patient-id"
                    hint='e.g. "PAT006"'
                  >
                    <input
                      id="patient-id"
                      value={data.patient.patientId}
                      onChange={(e) =>
                        handleChange("patient", "patientId", e.target.value)
                      }
                      placeholder="PAT006"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Full Name" htmlFor="patient-name">
                    <input
                      id="patient-name"
                      value={data.patient.name}
                      onChange={(e) =>
                        handleChange("patient", "name", e.target.value)
                      }
                      placeholder="Jane Doe"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field
                    label="Insurance Payer"
                    htmlFor="insurance-payer"
                    hint="Used for policy retrieval"
                  >
                    <input
                      id="insurance-payer"
                      value={data.patient.insurancePayer}
                      onChange={(e) =>
                        handleChange(
                          "patient",
                          "insurancePayer",
                          e.target.value,
                        )
                      }
                      placeholder="BlueCross"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Diagnosis Code (ICD)" htmlFor="diagnosis-code">
                    <input
                      id="diagnosis-code"
                      value={data.patient.diagnosisCode}
                      onChange={(e) =>
                        handleChange("patient", "diagnosisCode", e.target.value)
                      }
                      placeholder="M54.5"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Procedure Code (CPT)" htmlFor="procedure-code">
                    <input
                      id="procedure-code"
                      value={data.patient.procedureCode}
                      onChange={(e) =>
                        handleChange("patient", "procedureCode", e.target.value)
                      }
                      placeholder="72148"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Procedure Name" htmlFor="procedure-name">
                    <input
                      id="procedure-name"
                      value={data.patient.procedureName}
                      onChange={(e) =>
                        handleChange("patient", "procedureName", e.target.value)
                      }
                      placeholder="Lumbar MRI"
                      className={inputClass}
                      required
                    />
                  </Field>
                </div>
              </>
            )}

            {/* 2. CLINICAL NOTE FORM */}
            {currentStep === 1 && (
              <>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-bold">2. Clinical Note (EHR)</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Inject history and physical notes for this patient.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label="Patient ID"
                    htmlFor="note-patient-id"
                    hint="Auto-filled from Step 1"
                  >
                    <input
                      id="note-patient-id"
                      value={data.note.patientId}
                      onChange={(e) =>
                        handleChange("note", "patientId", e.target.value)
                      }
                      placeholder="PAT006"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field
                    label="Document ID"
                    htmlFor="note-document-id"
                    hint='e.g. "EHR-PAT006-001"'
                  >
                    <input
                      id="note-document-id"
                      value={data.note.documentId}
                      onChange={(e) =>
                        handleChange("note", "documentId", e.target.value)
                      }
                      placeholder="EHR-PAT006-001"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
                    <Field label="Note Date" htmlFor="note-date">
                      <input
                        id="note-date"
                        value={data.note.noteDate}
                        onChange={(e) =>
                          handleChange("note", "noteDate", e.target.value)
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
                      htmlFor="note-body"
                      hint="Enter the raw text of the physician's note."
                    >
                      <textarea
                        id="note-body"
                        value={data.note.bodyText}
                        onChange={(e) =>
                          handleChange("note", "bodyText", e.target.value)
                        }
                        rows={5}
                        placeholder="Patient completed 6 weeks of physical therapy..."
                        className={inputClass}
                        required
                      />
                    </Field>
                  </div>
                </div>
              </>
            )}

            {/* 3. MEDICATION FORM */}
            {currentStep === 2 && (
              <>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-bold">3. Pharmacy Record</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Inject medication history for this patient.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Patient ID" htmlFor="med-patient-id">
                    <input
                      id="med-patient-id"
                      value={data.medication.patientId}
                      onChange={(e) =>
                        handleChange("medication", "patientId", e.target.value)
                      }
                      placeholder="PAT006"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Document ID" htmlFor="med-document-id">
                    <input
                      id="med-document-id"
                      value={data.medication.documentId}
                      onChange={(e) =>
                        handleChange("medication", "documentId", e.target.value)
                      }
                      placeholder="RX-PAT006-001"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Drug Name" htmlFor="drug-name">
                    <input
                      id="drug-name"
                      value={data.medication.drugName}
                      onChange={(e) =>
                        handleChange("medication", "drugName", e.target.value)
                      }
                      placeholder="Ibuprofen 400mg"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field
                    label="Medication Category"
                    htmlFor="med-category"
                    hint="e.g., NSAID, Analgesic"
                  >
                    <input
                      id="med-category"
                      value={data.medication.category}
                      onChange={(e) =>
                        handleChange("medication", "category", e.target.value)
                      }
                      placeholder="NSAID"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Record Date" htmlFor="med-date">
                    <input
                      id="med-date"
                      value={data.medication.recordDate}
                      onChange={(e) =>
                        handleChange("medication", "recordDate", e.target.value)
                      }
                      type="date"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Status" htmlFor="med-status">
                    <select
                      id="med-status"
                      value={data.medication.status}
                      onChange={(e) =>
                        handleChange("medication", "status", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="stopped">Stopped</option>
                    </select>
                  </Field>
                </div>
              </>
            )}

            {/* 4. IMAGING FORM */}
            {currentStep === 3 && (
              <>
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-bold">4. Imaging Report</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Inject radiology findings for this patient.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Patient ID" htmlFor="img-patient-id">
                    <input
                      id="img-patient-id"
                      value={data.imaging.patientId}
                      onChange={(e) =>
                        handleChange("imaging", "patientId", e.target.value)
                      }
                      placeholder="PAT006"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Document ID" htmlFor="img-document-id">
                    <input
                      id="img-document-id"
                      value={data.imaging.documentId}
                      onChange={(e) =>
                        handleChange("imaging", "documentId", e.target.value)
                      }
                      placeholder="IMG-PAT006-001"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field
                    label="Body Part"
                    htmlFor="body-part"
                    hint='e.g. "Lumbar Spine"'
                  >
                    <input
                      id="body-part"
                      value={data.imaging.bodyPart}
                      onChange={(e) =>
                        handleChange("imaging", "bodyPart", e.target.value)
                      }
                      placeholder="Lumbar Spine"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <Field label="Report Date" htmlFor="img-date">
                    <input
                      id="img-date"
                      value={data.imaging.reportDate}
                      onChange={(e) =>
                        handleChange("imaging", "reportDate", e.target.value)
                      }
                      type="date"
                      className={inputClass}
                      required
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Findings / Report Text" htmlFor="findings">
                      <textarea
                        id="findings"
                        value={data.imaging.findings}
                        onChange={(e) =>
                          handleChange("imaging", "findings", e.target.value)
                        }
                        rows={4}
                        placeholder="Lumbar X-ray completed. Mild degenerative changes."
                        className={inputClass}
                        required
                      />
                    </Field>
                  </div>
                </div>
              </>
            )}

            {/* Form Controls (Next / Back) */}
            <div className="pt-8 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${currentStep === 0 ? "invisible" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </form>
        ) : (
          /* 5. REVIEW STEP */
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold">Review & Submit</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Verify the data below before saving it to the database.
              </p>
            </div>

            {/* Changed from a 2-column grid to a vertical stack (space-y-6) */}
            <div className="space-y-6">
              <ReviewCard
                title="Patient Profile"
                stepIndex={0}
                onEdit={jumpToStep}
              >
                <ReviewItem label="Patient ID" value={data.patient.patientId} />
                <ReviewItem label="Name" value={data.patient.name} />
                <ReviewItem
                  label="Insurance"
                  value={data.patient.insurancePayer}
                />
                <ReviewItem
                  label="Procedure"
                  value={`${data.patient.procedureName} (${data.patient.procedureCode})`}
                />
                <ReviewItem
                  label="Diagnosis"
                  value={data.patient.diagnosisCode}
                />
              </ReviewCard>

              <ReviewCard
                title="Clinical Note"
                stepIndex={1}
                onEdit={jumpToStep}
              >
                <ReviewItem label="Patient ID" value={data.note.patientId} />
                <ReviewItem label="Doc ID" value={data.note.documentId} />
                <ReviewItem label="Date" value={data.note.noteDate} />
                <div className="mt-2 grid grid-cols-[1fr_2fr] gap-4 py-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Body Text
                  </span>
                  <span className="text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-md leading-relaxed whitespace-pre-wrap">
                    {data.note.bodyText || "—"}
                  </span>
                </div>
              </ReviewCard>

              <ReviewCard title="Medication" stepIndex={2} onEdit={jumpToStep}>
                <ReviewItem
                  label="Patient ID"
                  value={data.medication.patientId}
                />
                <ReviewItem
                  label="Drug Name"
                  value={data.medication.drugName}
                />
                <ReviewItem label="Category" value={data.medication.category} />
                <ReviewItem label="Status" value={data.medication.status} />
              </ReviewCard>

              <ReviewCard title="Imaging" stepIndex={3} onEdit={jumpToStep}>
                <ReviewItem label="Patient ID" value={data.imaging.patientId} />
                <ReviewItem label="Body Part" value={data.imaging.bodyPart} />
                <ReviewItem label="Date" value={data.imaging.reportDate} />
                <div className="mt-2 grid grid-cols-[1fr_2fr] gap-4 py-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Findings
                  </span>
                  <span className="text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-md leading-relaxed whitespace-pre-wrap">
                    {data.imaging.findings || "—"}
                  </span>
                </div>
              </ReviewCard>
            </div>

            {/* Review Controls (Back / Submit All) */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                disabled={busy}
                onClick={handleBack}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <ArrowLeft size={16} /> Back
              </button>

              <button
                type="button"
                onClick={submitAllData}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 dark:hover:bg-emerald-500 focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70 transition-all"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? "Submitting All Data..." : "Submit All Records"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ─── Shared UI Components ─────────────────────────────────────────────── */

function Field({
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

function ReviewCard({
  title,
  stepIndex,
  onEdit,
  children,
}: {
  title: string;
  stepIndex: number;
  onEdit: (i: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm relative group transition-colors">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          {title}
        </h3>

        {/* Labeled Edit Button */}
        <button
          onClick={() => onEdit(stepIndex)}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          title={`Edit ${title}`}
        >
          <Pencil size={14} /> Edit
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
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

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20";
