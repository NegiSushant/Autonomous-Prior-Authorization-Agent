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
  Plus,
  Trash2,
} from "lucide-react";
import { ReviewItem } from "./ReviewItem";
import { ReviewCard } from "./ReviewCard";
import { Field } from "./Field";

type Message = { type: "success" | "error"; text: string };

const STEPS = [
  { id: "patient", title: "Patient Profile", icon: UserPlus },
  { id: "note", title: "Clinical Note", icon: FileText },
  { id: "medication", title: "Medication", icon: Pill },
  { id: "imaging", title: "Imaging", icon: ImageIcon },
  { id: "review", title: "Review", icon: CheckCircle2 },
];

export type InitialData = {
  patient: {
    id: string;
    name: string;
    insurancePayer: string;
    diagnosisCode: string;
    procedureCode: string;
    procedureName: string;
  };
  notes: {
    id?: string;
    patientId: string;
    documentId: string;
    noteDate: string;
    bodyText: string;
    sourceType?: string;
  }[];
  medications: {
    id?: string;
    patientId: string;
    documentId: string;
    drugName: string;
    category: string;
    recordDate: string;
    status: string;
  }[];
  imaging: {
    id?: string;
    patientId: string;
    documentId: string;
    bodyPart: string;
    findings: string;
    reportDate: string;
    sourceType?: string;
  }[];
};

type Props = {
  mode?: "create" | "view" | "edit";
  initialData?: InitialData;
};

export default function AdminClinicalData({
  mode = "create",
  initialData,
}: Props) {
  const [currentStep, setCurrentStep] = useState(mode === "create" ? 0 : 4);
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);

  // Unified State for the entire wizard
  const [data, setData] = useState(() => {
    if (initialData) {
      return {
        patient: {
          patientId: initialData.patient.id || "",
          name: initialData.patient.name || "",
          insurancePayer: initialData.patient.insurancePayer || "",
          diagnosisCode: initialData.patient.diagnosisCode || "",
          procedureCode: initialData.patient.procedureCode || "",
          procedureName: initialData.patient.procedureName || "",
        },
        notes:
          initialData.notes?.length > 0
            ? initialData.notes
            : [{ patientId: "", documentId: "", noteDate: "", bodyText: "" }],
        medications:
          initialData.medications?.length > 0
            ? initialData.medications
            : [
                {
                  patientId: "",
                  documentId: "",
                  drugName: "",
                  category: "",
                  recordDate: "",
                  status: "active",
                },
              ],
        imaging:
          initialData.imaging?.length > 0
            ? initialData.imaging
            : [
                {
                  patientId: "",
                  documentId: "",
                  bodyPart: "",
                  reportDate: "",
                  findings: "",
                },
              ],
      };
    }

    return {
      patient: {
        patientId: "",
        name: "",
        insurancePayer: "",
        diagnosisCode: "",
        procedureCode: "",
        procedureName: "",
      },
      notes: [{ patientId: "", documentId: "", noteDate: "", bodyText: "" }],
      medications: [
        {
          patientId: "",
          documentId: "",
          drugName: "",
          category: "",
          recordDate: "",
          status: "active",
        },
      ],
      imaging: [
        {
          patientId: "",
          documentId: "",
          bodyPart: "",
          reportDate: "",
          findings: "",
        },
      ],
    };
  });

  // Handler for single object sections
  const handleChange = (section: "patient", field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // Handler for array sections
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

  // Add a new blank entry to an array section
  const addArrayItem = (section: "notes" | "medications" | "imaging") => {
    setData((prev) => {
      const emptyItems = {
        notes: {
          patientId: prev.patient.patientId || "",
          documentId: "",
          noteDate: "",
          bodyText: "",
        },
        medications: {
          patientId: prev.patient.patientId || "",
          documentId: "",
          drugName: "",
          category: "",
          recordDate: "",
          status: "active",
        },
        imaging: {
          patientId: prev.patient.patientId || "",
          documentId: "",
          bodyPart: "",
          reportDate: "",
          findings: "",
        },
      };
      return { ...prev, [section]: [...prev[section], emptyItems[section]] };
    });
  };

  // Remove an entry from an array section
  const removeArrayItem = (
    section: "notes" | "medications" | "imaging",
    index: number,
  ) => {
    setData((prev) => {
      const arr = [...prev[section]];
      arr.splice(index, 1);
      return { ...prev, [section]: arr };
    });
  };

  // Move to the next step
  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Auto-fill Patient ID into ALL array items if moving from step 1
    if (currentStep === 0 && data.patient.patientId) {
      setData((prev) => {
        const fillPatientId = <T extends { patientId?: string }>(
          arr: T[],
        ): T[] =>
          arr.map((item) => ({
            ...item,
            patientId: item.patientId || prev.patient.patientId,
          }));

        return {
          ...prev,
          notes: fillPatientId(prev.notes),
          medications: fillPatientId(prev.medications),
          imaging: fillPatientId(prev.imaging),
        };
      });
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const jumpToStep = (index: number) => {
    if (mode === "view") return;
    setCurrentStep(index);
    window.scrollTo(0, 0);
  };

  const submitAllData = async () => {
    setBusy(true);
    setMessage(null);

    try {
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

      await apiCall("/api/admin/patients", data.patient);

      for (const note of data.notes) {
        if (note.documentId)
          await apiCall("/api/admin/notes", { ...note, sourceType: "EHR" });
      }

      for (const med of data.medications) {
        if (med.documentId) await apiCall("/api/admin/medications", med);
      }

      for (const img of data.imaging) {
        if (img.documentId)
          await apiCall("/api/admin/imaging", {
            ...img,
            sourceType: "Imaging",
          });
      }

      setMessage({
        type: "success",
        text: "Records successfully saved to the database!",
      });

      if (mode === "create") {
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
          notes: [
            { patientId: "", documentId: "", noteDate: "", bodyText: "" },
          ],
          medications: [
            {
              patientId: "",
              documentId: "",
              drugName: "",
              category: "",
              recordDate: "",
              status: "active",
            },
          ],
          imaging: [
            {
              patientId: "",
              documentId: "",
              bodyPart: "",
              reportDate: "",
              findings: "",
            },
          ],
        });
      }
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
      {/*Header*/}
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

      {/*Alert Banner */}
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

      {/*Stepper Progress Bar (Hidden in View Mode)*/}
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

                <div className="space-y-6">
                  {data.notes.map((note, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5 pt-8"
                    >
                      {data.notes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("notes", index)}
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Remove Entry"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <h3 className="absolute top-0 left-0 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-tl-xl rounded-br-xl">
                        Note #{index + 1}
                      </h3>

                      <div className="grid gap-6 md:grid-cols-2">
                        <Field label="Patient ID" htmlFor={`note-pid-${index}`}>
                          <input
                            id={`note-pid-${index}`}
                            value={note.patientId}
                            onChange={(e) =>
                              handleArrayChange(
                                "notes",
                                index,
                                "patientId",
                                e.target.value,
                              )
                            }
                            placeholder="PAT006"
                            className={inputClass}
                            required
                          />
                        </Field>
                        <Field
                          label="Document ID"
                          htmlFor={`note-docid-${index}`}
                        >
                          <input
                            id={`note-docid-${index}`}
                            value={note.documentId}
                            onChange={(e) =>
                              handleArrayChange(
                                "notes",
                                index,
                                "documentId",
                                e.target.value,
                              )
                            }
                            placeholder="EHR-PAT006-001"
                            className={inputClass}
                            required
                          />
                        </Field>
                        <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
                          <Field
                            label="Note Date"
                            htmlFor={`note-date-${index}`}
                          >
                            <input
                              id={`note-date-${index}`}
                              value={note.noteDate}
                              onChange={(e) =>
                                handleArrayChange(
                                  "notes",
                                  index,
                                  "noteDate",
                                  e.target.value,
                                )
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
                          >
                            <textarea
                              id={`note-body-${index}`}
                              value={note.bodyText}
                              onChange={(e) =>
                                handleArrayChange(
                                  "notes",
                                  index,
                                  "bodyText",
                                  e.target.value,
                                )
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
                    onClick={() => addArrayItem("notes")}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors py-2"
                  >
                    <Plus size={16} /> Add Another Note
                  </button>
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

                <div className="space-y-6">
                  {data.medications.map((med, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5 pt-8"
                    >
                      {data.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("medications", index)}
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
                        <Field label="Patient ID" htmlFor={`med-pid-${index}`}>
                          <input
                            id={`med-pid-${index}`}
                            value={med.patientId}
                            onChange={(e) =>
                              handleArrayChange(
                                "medications",
                                index,
                                "patientId",
                                e.target.value,
                              )
                            }
                            placeholder="PAT006"
                            className={inputClass}
                            required
                          />
                        </Field>
                        <Field
                          label="Document ID"
                          htmlFor={`med-docid-${index}`}
                        >
                          <input
                            id={`med-docid-${index}`}
                            value={med.documentId}
                            onChange={(e) =>
                              handleArrayChange(
                                "medications",
                                index,
                                "documentId",
                                e.target.value,
                              )
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
                            onChange={(e) =>
                              handleArrayChange(
                                "medications",
                                index,
                                "drugName",
                                e.target.value,
                              )
                            }
                            placeholder="Ibuprofen 400mg"
                            className={inputClass}
                            required
                          />
                        </Field>
                        <Field
                          label="Category"
                          htmlFor={`med-category-${index}`}
                        >
                          <input
                            id={`med-category-${index}`}
                            value={med.category}
                            onChange={(e) =>
                              handleArrayChange(
                                "medications",
                                index,
                                "category",
                                e.target.value,
                              )
                            }
                            placeholder="NSAID"
                            className={inputClass}
                            required
                          />
                        </Field>
                        <Field
                          label="Record Date"
                          htmlFor={`med-date-${index}`}
                        >
                          <input
                            id={`med-date-${index}`}
                            value={med.recordDate}
                            onChange={(e) =>
                              handleArrayChange(
                                "medications",
                                index,
                                "recordDate",
                                e.target.value,
                              )
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
                            onChange={(e) =>
                              handleArrayChange(
                                "medications",
                                index,
                                "status",
                                e.target.value,
                              )
                            }
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
                    onClick={() => addArrayItem("medications")}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors py-2"
                  >
                    <Plus size={16} /> Add Another Medication
                  </button>
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

                <div className="space-y-6">
                  {data.imaging.map((img, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5 pt-8"
                    >
                      {data.imaging.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("imaging", index)}
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
                        <Field label="Patient ID" htmlFor={`img-pid-${index}`}>
                          <input
                            id={`img-pid-${index}`}
                            value={img.patientId}
                            onChange={(e) =>
                              handleArrayChange(
                                "imaging",
                                index,
                                "patientId",
                                e.target.value,
                              )
                            }
                            placeholder="PAT006"
                            className={inputClass}
                            required
                          />
                        </Field>
                        <Field
                          label="Document ID"
                          htmlFor={`img-docid-${index}`}
                        >
                          <input
                            id={`img-docid-${index}`}
                            value={img.documentId}
                            onChange={(e) =>
                              handleArrayChange(
                                "imaging",
                                index,
                                "documentId",
                                e.target.value,
                              )
                            }
                            placeholder="IMG-PAT006-001"
                            className={inputClass}
                            required
                          />
                        </Field>
                        <Field label="Body Part" htmlFor={`body-part-${index}`}>
                          <input
                            id={`body-part-${index}`}
                            value={img.bodyPart}
                            onChange={(e) =>
                              handleArrayChange(
                                "imaging",
                                index,
                                "bodyPart",
                                e.target.value,
                              )
                            }
                            placeholder="Lumbar Spine"
                            className={inputClass}
                            required
                          />
                        </Field>
                        <Field
                          label="Report Date"
                          htmlFor={`img-date-${index}`}
                        >
                          <input
                            id={`img-date-${index}`}
                            value={img.reportDate}
                            onChange={(e) =>
                              handleArrayChange(
                                "imaging",
                                index,
                                "reportDate",
                                e.target.value,
                              )
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
                                handleArrayChange(
                                  "imaging",
                                  index,
                                  "findings",
                                  e.target.value,
                                )
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
                    onClick={() => addArrayItem("imaging")}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors py-2"
                  >
                    <Plus size={16} /> Add Another Imaging Report
                  </button>
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
              <h2 className="text-xl font-bold">Review Data</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Verify all attached records below.
              </p>
            </div>

            {/* Vertical Stack for Arrays */}
            <div className="space-y-6">
              <ReviewCard
                title="Patient Profile"
                stepIndex={0}
                onEdit={jumpToStep}
                hideEdit={mode === "view"}
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

              {data.notes.map((note, idx) => (
                <ReviewCard
                  key={note.id || idx}
                  title={`Clinical Note ${data.notes.length > 1 ? `#${idx + 1}` : ""}`}
                  stepIndex={1}
                  onEdit={jumpToStep}
                  hideEdit={mode === "view"}
                >
                  <ReviewItem label="Patient ID" value={note.patientId} />
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

              {data.medications.map((med, idx) => (
                <ReviewCard
                  key={med.id || idx}
                  title={`Medication ${data.medications.length > 1 ? `#${idx + 1}` : ""}`}
                  stepIndex={2}
                  onEdit={jumpToStep}
                  hideEdit={mode === "view"}
                >
                  <ReviewItem label="Patient ID" value={med.patientId} />
                  <ReviewItem label="Drug Name" value={med.drugName} />
                  <ReviewItem label="Category" value={med.category} />
                  <ReviewItem label="Status" value={med.status} />
                </ReviewCard>
              ))}

              {data.imaging.map((img, idx) => (
                <ReviewCard
                  key={img.id || idx}
                  title={`Imaging ${data.imaging.length > 1 ? `#${idx + 1}` : ""}`}
                  stepIndex={3}
                  onEdit={jumpToStep}
                  hideEdit={mode === "view"}
                >
                  <ReviewItem label="Patient ID" value={img.patientId} />
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
                onClick={
                  mode === "view" ? () => window.history.back() : handleBack
                }
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <ArrowLeft size={16} /> Back
              </button>

              <button
                type="button"
                onClick={submitAllData}
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
        )}
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20";
