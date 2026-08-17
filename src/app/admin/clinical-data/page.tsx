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
} from "lucide-react";

type Message = { type: "success" | "error"; text: string };
type TabId = "patient" | "note" | "medication" | "imaging";

export default function AdminClinicalDataPage() {
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("patient");

  async function postJson(url: string, body: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({
          type: "error",
          text: data.message || "Request failed",
        });
        return;
      }
      setMessage({
        type: "success",
        text: data.message || "Saved successfully",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function createPatient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await postJson("/api/admin/patients", {
      patientId: String(fd.get("patientId") || "").trim(),
      name: String(fd.get("name") || "").trim(),
      insurancePayer: String(fd.get("insurancePayer") || "").trim(),
      procedureCode: String(fd.get("procedureCode") || "").trim(),
      procedureName: String(fd.get("procedureName") || "").trim(),
      diagnosisCode: String(fd.get("diagnosisCode") || "").trim(),
    });
    if (message?.type !== "error") e.currentTarget.reset();
  }

  async function createNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await postJson("/api/admin/notes", {
      patientId: String(fd.get("patientId") || "").trim(),
      documentId: String(fd.get("documentId") || "").trim(),
      noteDate: String(fd.get("noteDate") || "").trim(),
      bodyText: String(fd.get("bodyText") || "").trim(),
      sourceType: "EHR",
    });
    if (message?.type !== "error") e.currentTarget.reset();
  }

  async function createMedication(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await postJson("/api/admin/medications", {
      patientId: String(fd.get("patientId") || "").trim(),
      documentId: String(fd.get("documentId") || "").trim(),
      drugName: String(fd.get("drugName") || "").trim(),
      category: String(fd.get("category") || "").trim(),
      recordDate: String(fd.get("recordDate") || "").trim(),
      status: String(fd.get("status") || "active").trim(),
    });
    if (message?.type !== "error") e.currentTarget.reset();
  }

  async function createImaging(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await postJson("/api/admin/imaging", {
      patientId: String(fd.get("patientId") || "").trim(),
      documentId: String(fd.get("documentId") || "").trim(),
      bodyPart: String(fd.get("bodyPart") || "").trim(),
      findings: String(fd.get("findings") || "").trim(),
      reportDate: String(fd.get("reportDate") || "").trim(),
      sourceType: "Imaging",
    });
    if (message?.type !== "error") e.currentTarget.reset();
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "patient", label: "Patient", icon: <UserPlus size={18} /> },
    { id: "note", label: "Clinical Note", icon: <FileText size={18} /> },
    { id: "medication", label: "Medication", icon: <Pill size={18} /> },
    { id: "imaging", label: "Imaging Report", icon: <ImageIcon size={18} /> },
  ];

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-8 text-slate-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Admin · Clinical Data
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Create mock patients and inject clinical evidence (notes, medications,
          imaging) into the sandbox database for the prior-authorization agent to evaluate.
        </p>
      </div>

      {/* Alert Banner */}
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

      {/* Tabs Navigation */}
      <div className="flex space-x-1 overflow-x-auto rounded-xl bg-slate-100/80 dark:bg-slate-800/50 p-1 shadow-inner no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage(null);
              }}
              className={`flex min-w-max items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                  : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Forms Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* 1. PATIENT FORM */}
        {activeTab === "patient" && (
          <form onSubmit={createPatient} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold">Patient Profile</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Register a new patient and their associated procedure details.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Patient ID" htmlFor="patient-id" hint='e.g. "PAT006"'>
                <input id="patient-id" name="patientId" placeholder="PAT006" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Full Name" htmlFor="patient-name">
                <input id="patient-name" name="name" placeholder="Jane Doe" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Insurance Payer" htmlFor="insurance-payer" hint="Used for policy retrieval">
                <input id="insurance-payer" name="insurancePayer" placeholder="BlueCross" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Diagnosis Code (ICD)" htmlFor="diagnosis-code">
                <input id="diagnosis-code" name="diagnosisCode" placeholder="M54.5" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Procedure Code (CPT)" htmlFor="procedure-code">
                <input id="procedure-code" name="procedureCode" placeholder="72148" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Procedure Name" htmlFor="procedure-name">
                <input id="procedure-name" name="procedureName" placeholder="Lumbar MRI" className={inputClass} required disabled={busy} />
              </Field>
            </div>

            <SubmitButton busy={busy} label="Save Patient" />
          </form>
        )}

        {/* 2. CLINICAL NOTE FORM */}
        {activeTab === "note" && (
          <form onSubmit={createNote} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold">Clinical Note (EHR)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Inject notes discoverable via <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-blue-500">search_ehr_notes</code> tool.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Patient ID" htmlFor="note-patient-id" hint="Must match an existing patient">
                <input id="note-patient-id" name="patientId" placeholder="PAT006" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Document ID" htmlFor="note-document-id" hint='e.g. "EHR-PAT006-001"'>
                <input id="note-document-id" name="documentId" placeholder="EHR-PAT006-001" className={inputClass} required disabled={busy} />
              </Field>

              <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
                <Field label="Note Date" htmlFor="note-date">
                  <input id="note-date" name="noteDate" type="date" className={inputClass} required disabled={busy} />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Note Text" htmlFor="note-body" hint="Enter the raw text of the physician's note.">
                  <textarea id="note-body" name="bodyText" rows={5} placeholder="Patient completed 6 weeks of physical therapy..." className={inputClass} required disabled={busy} />
                </Field>
              </div>
            </div>

            <SubmitButton busy={busy} label="Save Clinical Note" />
          </form>
        )}

        {/* 3. MEDICATION FORM */}
        {activeTab === "medication" && (
          <form onSubmit={createMedication} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold">Pharmacy Record</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Inject medications discoverable via <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-blue-500">search_pharmacy_records</code> tool.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Patient ID" htmlFor="med-patient-id">
                <input id="med-patient-id" name="patientId" placeholder="PAT006" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Document ID" htmlFor="med-document-id">
                <input id="med-document-id" name="documentId" placeholder="RX-PAT006-001" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Drug Name" htmlFor="drug-name">
                <input id="drug-name" name="drugName" placeholder="Ibuprofen 400mg" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Medication Category" htmlFor="med-category" hint="e.g., NSAID, Analgesic">
                <input id="med-category" name="category" placeholder="NSAID" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Record Date" htmlFor="med-date">
                <input id="med-date" name="recordDate" type="date" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Status" htmlFor="med-status">
                <select id="med-status" name="status" className={inputClass} defaultValue="active" disabled={busy}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="stopped">Stopped</option>
                </select>
              </Field>
            </div>

            <SubmitButton busy={busy} label="Save Medication" />
          </form>
        )}

        {/* 4. IMAGING FORM */}
        {activeTab === "imaging" && (
          <form onSubmit={createImaging} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
             <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold">Imaging Report</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Inject reports discoverable via <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-blue-500">search_imaging_history</code> tool.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Patient ID" htmlFor="img-patient-id">
                <input id="img-patient-id" name="patientId" placeholder="PAT006" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Document ID" htmlFor="img-document-id">
                <input id="img-document-id" name="documentId" placeholder="IMG-PAT006-001" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Body Part" htmlFor="body-part" hint='e.g. "Lumbar Spine"'>
                <input id="body-part" name="bodyPart" placeholder="Lumbar Spine" className={inputClass} required disabled={busy} />
              </Field>

              <Field label="Report Date" htmlFor="img-date">
                <input id="img-date" name="reportDate" type="date" className={inputClass} required disabled={busy} />
              </Field>

              <div className="md:col-span-2">
                <Field label="Findings / Report Text" htmlFor="findings">
                  <textarea id="findings" name="findings" rows={4} placeholder="Lumbar X-ray completed. Mild degenerative changes." className={inputClass} required disabled={busy} />
                </Field>
              </div>
            </div>

            <SubmitButton busy={busy} label="Save Imaging Report" />
          </form>
        )}
      </div>
    </main>
  );
}

/* Shared UI Components*/

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
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">{hint}</p>
      )}
    </div>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
      <button
        type="submit"
        disabled={busy}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70 transition-all duration-200"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? "Saving..." : label}
      </button>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20";