"use client";

import { useEffect, useState } from "react";
import { Play, Eye, Loader2, ShieldPlus } from "lucide-react";
import { IPatient } from "@/types/patient.entity";


interface PatientTableProps {
  selectedPatientId: number | null;
  onSelect: (patientId: number) => void;
  onRun: (patientId: number) => void;
  isInvestigating: boolean;
}

export default function PatientTable({
  selectedPatientId,
  onSelect,
  onRun,
  isInvestigating,
}: PatientTableProps) {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch("/api//admin/patients");
        if (!res.ok) throw new Error("Failed to fetch patients");
        const data = await res.json();

        // Handle standard { data: [...] } or direct array responses
        setPatients(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
        Error loading patients: {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Insurance Payer</th>
              <th className="px-6 py-4 font-semibold">Procedure</th>
              <th className="px-6 py-4 font-semibold">Diagnosis Code</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {patients.map((patient) => {
              const isSelected = selectedPatientId === patient.id;
              const isRunning = isSelected && isInvestigating;

              return (
                <tr
                  key={patient.id}
                  className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    isSelected ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {patient.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <ShieldPlus size={14} className="text-slate-400" />
                      {patient.insurancePayer}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {patient.procedureCode}
                      </span>
                      <span
                        className="text-xs text-slate-500 max-w-50 truncate"
                        title={patient.procedureName}
                      >
                        {patient.procedureName}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {patient.diagnosisCode}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onSelect(patient.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                      >
                        <Eye size={14} />
                        View
                      </button>

                      <button
                        onClick={() => onRun(patient.id)}
                        disabled={isRunning}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
                      >
                        {isRunning ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play size={14} />
                            Process
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {patients.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
