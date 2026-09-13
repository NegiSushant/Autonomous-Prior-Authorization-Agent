"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Building2,
  Pencil,
  Trash2,
  Loader2,
  X,
  ChevronRight,
  ChevronLeft,
  User2,
  UserShield,
} from "lucide-react";
import OrganizationForm from "@/components/admin/OrganizationForm";
import { useClientTable } from "@/hooks/useClientTable";
import { SortIcon } from "@/components/SortIcon";

type Organization = {
  id: number;
  name: string;
  type: string;
  email: string | null;
  domain: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdBy: string;
  _count: {
    users: number;
    patients: number;
  };
};

type SortKey =
  | "id"
  | "name"
  | "type"
  | "domain"
  | "email"
  | "phone"
  | "users"
  | "patients"
  | "status"
  | "createdBy";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

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
  } = useClientTable<Organization, SortKey>({
    data: organizations,
    initialSortKey: "id",
    searchKeys: (org) => [
      org.name,
      org.type,
      org.email || "",
      org.domain || "",
      org.phone || "",
      org.createdBy,
      org.isActive ? "active" : "inactive",
    ],
    getSortValue: (org, key) => {
      switch (key) {
        case "id":
          return org.id;
        case "name":
          return org.name.toLowerCase();
        case "type":
          return org.type.toLowerCase();
        case "email":
          return (org.email || "").toLowerCase();
        case "domain":
          return (org.domain || "").toLowerCase();
        case "phone":
          return (org.phone || "").toLowerCase();
        case "users":
          return org._count.users;
        case "patients":
          return org._count.patients;
        case "status":
          return org.isActive ? 1 : 0;
        case "createdBy":
          return org.createdBy.toLowerCase();
      }
    },
  });

  // Added isInitialMount flag to prevent synchronous setState warning
  const fetchOrganizations = async (isInitialMount = false) => {
    try {
      if (!isInitialMount) setLoading(true);

      const res = await fetch("/api/admin/organizations");
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load organizations");
      }

      setOrganizations(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchOrganizations();
    };
    init();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedOrg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (org: Organization) => {
    setModalMode("edit");
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrg(null);
  };

  const handleSuccess = () => {
    closeModal();
    fetchOrganizations();
  };

  return (
    <div className="space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Organizations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage hospitals and clinics in the system
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus size={16} />
          Add Organization
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-0">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizations..."
              className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading organizations...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-left transition-colors">
                    {/* Sr. No. — sortable by id */}
                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("id")}
                        className="inline-flex items-center gap-1.5 hover:text-white transition"
                      >
                        Sr. No.
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
                        onClick={() => handleSort("type")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Type
                        <SortIcon
                          column="type"
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
                        Email
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
                        onClick={() => handleSort("domain")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Domain
                        <SortIcon
                          column="domain"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("phone")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Phone
                        <SortIcon
                          column="phone"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium text-center">
                      <button
                        type="button"
                        onClick={() => handleSort("users")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Users
                        <SortIcon
                          column="users"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium text-center">
                      <button
                        type="button"
                        onClick={() => handleSort("patients")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Patients
                        <SortIcon
                          column="patients"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("status")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Status
                        <SortIcon
                          column="status"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("createdBy")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Created By
                        <SortIcon
                          column="createdBy"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Building2
                            size={32}
                            className="text-slate-400 dark:text-slate-600"
                          />
                          <p>
                            {search.trim()
                              ? "No organizations match your search."
                              : "No organizations found."}
                          </p>
                          {!search.trim() && (
                            <button
                              onClick={openCreateModal}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                            >
                              Create the first organization
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((org, index) => {
                      const serialNumber =
                        (currentPage - 1) * pageSize + index + 1;
                      return (
                        <tr
                          key={org.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-5 py-3 font-mono text-blue-600 dark:text-blue-400 font-medium">
                            {serialNumber}
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                            {org.name}
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {org.type}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                            {org.email || "—"}
                          </td>
                          <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                            {org.domain || "—"}
                          </td>
                          <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                            {org.phone || "—"}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium">
                              {org._count.users}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium">
                              {org._count.patients}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {org.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs">
                            {org.createdBy}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3 ">
                              {/** Edit User Button */}
                              <button
                                onClick={() => openEditModal(org)}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>

                              {/** View user */}
                              <button
                                // onClick={() => openEditModal(org)}
                                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors cursor-pointer"
                                title="view user"
                              >
                                <User2 size={15} />
                              </button>

                              {/** View patient */}
                              <button
                                // onClick={() => openEditModal(org)}
                                className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors cursor-pointer"
                                title="view patient"
                              >
                                <UserShield size={15} />
                              </button>

                              {/**Delete Orgs button */}
                              <button
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={15} />
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
            {/* Footer: Showing X–Y of Z + Previous / Next */}
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 transition-colors">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {modalMode === "create"
                  ? "Add Organization"
                  : "Edit Organization"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <OrganizationForm
                mode={modalMode}
                organizationId={selectedOrg?.id}
                initialData={
                  selectedOrg
                    ? {
                        name: selectedOrg.name,
                        type: selectedOrg.type,
                        address: selectedOrg.address || "",
                        phone: selectedOrg.phone || "",
                        email: selectedOrg.email || "",
                        domain: selectedOrg.domain || "",
                        isActive: selectedOrg.isActive,
                      }
                    : undefined
                }
                onSuccess={handleSuccess}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
