"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Loader2,
  X,
  UserRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminClinicalData from "@/components/admin/AdminClinicalData";
import { InitialData } from "@/components/admin/steps/constants";
import { PatientFullResponseDto } from "@/types/patient.dto";
import { useClientTable } from "@/hooks/useClientTable";
import { SortIcon } from "@/components/SortIcon";

type SortKey =
  | "id"
  | "name"
  | "email"
  | "insurance"
  | "procedure"
  | "diagnosis"
  | "notes"
  | "meds"
  | "imaging";

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientFullResponseDto[]>([]);
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

  const {
    search,
    setSearch,
    pageSize,
    setPageSize,
    pageSizeOptions,
    currentPage,
    sortKey,
    sortDirection,
    handleSort,
    paginatedData,
    totalItems,
    totalPages,
    // startEntry,
    endEntry,
    goToPrevious,
    goToNext,
  } = useClientTable<PatientFullResponseDto, SortKey>({
    data: patients,
    initialSortKey: "id",
    searchKeys: (p) => [
      String(p.id ?? ""),
      p.name || "",
      p.email || "",
      p.insurancePayer || "",
      p.procedureCode || "",
      p.procedureName || "",
      p.diagnosisCode || "",
    ],
    getSortValue: (p, key) => {
      switch (key) {
        case "id":
          return p.id ?? 0;
        case "name":
          return (p.name || "").toLowerCase();
        case "email":
          return (p.email || "").toLowerCase();
        case "insurance":
          return (p.insurancePayer || "").toLowerCase();
        case "procedure":
          return `${p.procedureCode || ""} ${p.procedureName || ""}`.toLowerCase();
        case "diagnosis":
          return (p.diagnosisCode || "").toLowerCase();
        case "notes":
          return p.notes?.length ?? 0;
        case "meds":
          return p.medications?.length ?? 0;
        case "imaging":
          return p.imagingReports?.length ?? 0;
      }
    },
  });

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/admin/patients");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load");
      }
      setPatients(json.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchPatients();
    };

    init();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setInitialData(undefined);
    setIsModalOpen(true);
  };

  const openPatientModal = async (id: number, mode: "view" | "edit") => {
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

  // --- DELETE HANDLER ---
  const handleDelete = async (id: number) => {
    // Add a confirmation dialog so records aren't accidentally deleted
    if (
      !window.confirm(
        "Are you sure you want to delete this patient and all their associated records? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/patients/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete patient");
      }

      // Refresh the patient list automatically after a successful deletion
      void refreshPatients();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete patient");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInitialData(undefined);
  };

  const refreshPatients = async () => {
    setLoading(true);
    setError(null);
    await fetchPatients();
  };

  const handleSuccess = () => {
    closeModal();
    void refreshPatients();
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
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-left">
                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("id")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Patient ID
                        <SortIcon
                          column="id"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("name")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Name
                        <SortIcon
                          column="name"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("email")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Patient Email
                        <SortIcon
                          column="email"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("insurance")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Insurance
                        <SortIcon
                          column="insurance"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("procedure")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Procedure
                        <SortIcon
                          column="procedure"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("diagnosis")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Diagnosis
                        <SortIcon
                          column="diagnosis"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium text-center">
                      <button
                        type="button"
                        onClick={() => handleSort("notes")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Notes
                        <SortIcon
                          column="notes"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium text-center">
                      <button
                        type="button"
                        onClick={() => handleSort("meds")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Meds
                        <SortIcon
                          column="meds"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium text-center">
                      <button
                        type="button"
                        onClick={() => handleSort("imaging")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Imaging
                        <SortIcon
                          column="imaging"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {!Array.isArray(patients) || paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <UserRound size={32} className="text-slate-400" />
                          <p>
                            {search.trim()
                              ? "No patients match your search."
                              : "No patients found."}
                          </p>
                          {!search.trim() && (
                            <button
                              onClick={openCreateModal}
                              className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                            >
                              Create the first patient
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((patient, index) => {
                      const serialNumber =
                        (currentPage - 1) * pageSize + index + 1;
                      return (
                        <tr
                          key={patient.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-5 py-3 font-mono text-slate-400">
                            {serialNumber}
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                            {patient.name}
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                            {patient.email}
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
                              {patient.notes.length ?? 0}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                              {patient.medications.length ?? 0}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                              {patient.imagingReports.length ?? 0}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  if (patient.id == null) return;
                                  openPatientModal(patient.id, "view");
                                }}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-semibold cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  if (patient.id == null) return;
                                  openPatientModal(patient.id, "edit");
                                }}
                                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-semibold cursor-pointer"
                              >
                                Edit
                              </button>
                              {/* --- DELETE BUTTON --- */}
                              <button
                                onClick={() => {
                                  if (patient.id == null) return;
                                  handleDelete(patient.id);
                                }}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
              <div>
                {totalItems === 0
                  ? "Showing 0 entries"
                  : `Showing ${endEntry} of ${totalItems} entries`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="px-2 text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={goToNext}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
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
