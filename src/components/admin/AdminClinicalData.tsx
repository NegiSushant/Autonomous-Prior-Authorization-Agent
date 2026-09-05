"use client";

import { useState } from "react";
import {
  UserPlus,
  FileText,
  Pill,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import PatientStep from "./steps/PatientStep";
import NotesStep from "./steps/NotesStep";
import MedicationsStep from "./steps/MedicationsStep";
import ImagingStep from "./steps/ImagingStep";
import ReviewStep from "./steps/ReviewStep";
import { InitialData } from "./steps/constants";

type Message = { type: "success" | "error"; text: string };

const STEPS = [
  { id: "patient", title: "Patient Profile", icon: UserPlus },
  { id: "note", title: "Clinical Note", icon: FileText },
  { id: "medication", title: "Medication", icon: Pill },
  { id: "imaging", title: "Imaging", icon: ImageIcon },
  { id: "review", title: "Review", icon: CheckCircle2 },
];

type Props = {
  mode?: "create" | "view" | "edit";
  initialData?: InitialData;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function AdminClinicalData({
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const [currentStep, setCurrentStep] = useState(mode === "create" ? 0 : 4);
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);

  // Unified State
  const [data, setData] = useState<InitialData>(() => {
    if (initialData) return initialData;
    return {
      patient: {
        name: "",
        email: "",
        insurancePayer: "",
        diagnosisCode: "",
        procedureCode: "",
        procedureName: "",
        organizationId: "",
      },
      notes: [
        { patientId: undefined, documentId: "", noteDate: "", bodyText: "" },
      ],
      medications: [
        {
          documentId: "",
          drugName: "",
          category: "",
          recordDate: "",
          status: "active",
        },
      ],
      imaging: [
        {
          documentId: "",
          bodyPart: "",
          reportDate: "",
          findings: "",
        },
      ],
    };
  });

  // State Mutators
  const handlePatientChange = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      patient: { ...prev.patient, [field]: value },
    }));
  };

  const handleArrayChange = (
    section: "notes" | "medications" | "imaging",
    index: number,
    field: string,
    value: string,
  ) => {
    setData((prev) => {
      const arr = [...prev[section]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: arr };
    });
  };

  const addArrayItem = (section: "notes" | "medications" | "imaging") => {
    const pid = data.patient.id;
    const emptyMap = {
      notes: {
        ...(pid !== undefined ? { patientId: pid } : {}),
        documentId: "",
        noteDate: "",
        bodyText: "",
      },
      medications: {
        ...(pid !== undefined ? { patientId: pid } : {}),
        documentId: "",
        drugName: "",
        category: "",
        recordDate: "",
        status: "active",
      },
      imaging: {
        ...(pid !== undefined ? { patientId: pid } : {}),
        documentId: "",
        bodyPart: "",
        reportDate: "",
        findings: "",
      },
    };
    setData((prev) => ({
      ...prev,
      [section]: [...prev[section], emptyMap[section]],
    }));
  };

  const removeArrayItem = (
    section: "notes" | "medications" | "imaging",
    index: number,
  ) => {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  // Navigation
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 0 && data.patient.id != null) {
      const pid = data.patient.id;
      const fillPid = <T extends { patientId?: number }>(arr: T[]): T[] =>
        arr.map((item) => ({
          ...item,
          patientId: item.patientId ?? pid,
        }));

      setData((prev) => ({
        ...prev,
        notes: fillPid(prev.notes),
        medications: fillPid(prev.medications),
        imaging: fillPid(prev.imaging),
      }));
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (onCancel) {
      // Fixed: Hooked up unused onCancel to the initial back action
      onCancel();
    }
  };

  const jumpToStep = (index: number) => {
    if (mode !== "view") {
      setCurrentStep(index);
      window.scrollTo(0, 0);
    }
  };

  // 🚀 SINGLE BULK API CALL
  const submitAllData = async () => {
    setBusy(true);
    setMessage(null);

    try {
      // Filter out empty rows where the user didn't enter a Document ID
      const payload = {
        patient: data.patient,
        notes: data.notes
          .filter((n) => n.documentId.trim() !== "")
          .map((n) => ({ ...n, sourceType: "EHR" })),
        medications: data.medications.filter((m) => m.documentId.trim() !== ""),
        imaging: data.imaging
          .filter((i) => i.documentId.trim() !== "")
          .map((i) => ({ ...i, sourceType: "Imaging" })),
      };

      const endpoint =
        mode === "edit" && data.patient.id
          ? `/api/admin/patients/${data.patient.id}`
          : "/api/admin/patients";

      const res = await fetch(endpoint, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to save records");

      setMessage({
        type: "success",
        text:
          mode === "edit"
            ? "Patient records successfully updated!"
            : "All records successfully saved in bulk!",
      });

      if (mode === "create") {
        setCurrentStep(0);
        onSuccess?.();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8 space-y-8 text-slate-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {mode === "view"
            ? "Patient Clinical Profile"
            : "Patient Clinical Data Setup"}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          {mode === "view"
            ? "Review the clinical evidence currently attached to this patient record."
            : "Create patients and sequentially inject supporting clinical evidence into the system."}
        </p>
      </div>

      {/* Fixed: Render Unused Alert Banner */}
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
            type="button"
            onClick={() => setMessage(null)}
            className="shrink-0 rounded-lg p-1 opacity-70 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stepper Progress Bar (Hidden in View Mode) */}
      {mode !== "view" && (
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
                  {isCompleted ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
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
      )}

      {/* Forms Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {currentStep < 4 ? (
          <form
            onSubmit={handleNext}
            className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {/* INJECT EXTRACTED COMPONENTS HERE */}
            {currentStep === 0 && (
              <PatientStep
                data={data.patient}
                onChange={handlePatientChange}
                mode={mode}
              />
            )}

            {/* Fixed: Added explicit typing (idx: number, field: string, val: string) to inline funcs */}
            {currentStep === 1 && (
              <NotesStep
                notes={data.notes}
                onChange={(idx: number, field: string, val: string) =>
                  handleArrayChange("notes", idx, field, val)
                }
                onAdd={() => addArrayItem("notes")}
                onRemove={(idx: number) => removeArrayItem("notes", idx)}
                mode={mode}
              />
            )}

            {currentStep === 2 && (
              <MedicationsStep
                medications={data.medications}
                onChange={(idx: number, field: string, val: string) =>
                  handleArrayChange("medications", idx, field, val)
                }
                onAdd={() => addArrayItem("medications")}
                onRemove={(idx: number) => removeArrayItem("medications", idx)}
                mode={mode}
              />
            )}

            {currentStep === 3 && (
              <ImagingStep
                imaging={data.imaging}
                onChange={(idx: number, field: string, val: string) =>
                  handleArrayChange("imaging", idx, field, val)
                }
                onAdd={() => addArrayItem("imaging")}
                onRemove={(idx: number) => removeArrayItem("imaging", idx)}
                mode={mode}
              />
            )}

            {/* Navigation Buttons */}
            <div className="pt-8 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  currentStep === 0 && !onCancel
                    ? "invisible"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <ArrowLeft size={16} />{" "}
                {currentStep === 0 && onCancel ? "Cancel" : "Back"}
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
          <ReviewStep
            data={data}
            mode={mode}
            busy={busy}
            onBack={handleBack}
            onEdit={jumpToStep}
            onSubmit={submitAllData}
          />
        )}
      </div>
    </main>
  );
}
