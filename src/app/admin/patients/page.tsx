"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Loader2, X, UserRound } from "lucide-react";
import AdminClinicalData, {
  InitialData,
} from "@/components/admin/AdminClinicalData"; // adjust path

type PatientRow = {
  id: string;
  name: string;
  insurancePayer: string;
  procedureCode: string;
  procedureName: string;
  diagnosisCode: string;
  _count: {
    notes: number;
    medications: number;
    imagingReports: number;
  };
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">(
    "create",
  );
  const [initialData, setInitialData] = useState<InitialData | undefined>(
    undefined,
  );
  const [modalLoading, setModalLoading] = useState(false);

  const fetchPatients = async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/patients");
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to load");
      setPatients(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const openPatientModal = async (id: string, mode: "view" | "edit") => {
    setModalMode(mode);
    setModalLoading(true);
    setIsModalOpen(true);
    setInitialData(undefined);

    try {
      const res = await fetch(`/api/admin/patients/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to load patient");
      setInitialData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patient");
      setIsModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInitialData(undefined);
  };

  const handleSuccess = () => {
    closeModal();
    setLoading(true);
    fetchPatients();
  };

  return (
    <div className="space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Patient Information
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and manage all registered patients
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus size={16} />
          Add Patient
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>Show</span>
            <select className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white outline-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading patients...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-400">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-left">
                  <th className="px-5 py-3 font-medium">Patient ID</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Insurance</th>
                  <th className="px-5 py-3 font-medium">Procedure</th>
                  <th className="px-5 py-3 font-medium">Diagnosis</th>
                  <th className="px-5 py-3 font-medium text-center">Notes</th>
                  <th className="px-5 py-3 font-medium text-center">Meds</th>
                  <th className="px-5 py-3 font-medium text-center">Imaging</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {patients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <UserRound size={32} className="text-slate-400" />
                        <p>No patients found.</p>
                        <button
                          onClick={openCreateModal}
                          className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                        >
                          Create the first patient
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-blue-600 dark:text-blue-400 font-medium">
                        {patient.id}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                        {patient.name}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {patient.insurancePayer}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {patient.procedureCode}
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {patient.procedureName}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {patient.diagnosisCode}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                          {patient._count.notes}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                          {patient._count.medications}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                          {patient._count.imagingReports}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openPatientModal(patient.id, "view")}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-semibold"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openPatientModal(patient.id, "edit")}
                            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-semibold"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal panel – large because wizard is big */}
          <div className="relative w-full max-w-4xl my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {modalMode === "create" && "Add Patient"}
                {modalMode === "edit" && "Edit Patient"}
                {modalMode === "view" && "View Patient"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[80vh] overflow-y-auto">
              {modalLoading ? (
                <div className="flex items-center justify-center py-24 text-slate-400">
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Loading patient data...
                </div>
              ) : (
                <AdminClinicalData
                  key={`${modalMode}-${initialData?.patient?.id ?? "new"}`}
                  mode={modalMode}
                  initialData={initialData}
                  onSuccess={handleSuccess}
                  onCancel={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
