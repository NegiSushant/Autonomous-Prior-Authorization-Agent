"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Loader2,
  Pencil,
  Trash2,
  X,
  Users,
  ChevronRight,
  ChevronLeft,
  UserShield,
} from "lucide-react";
import UserForm from "@/components/admin/UserForm";
import { useClientTable } from "@/hooks/useClientTable";
import { SortIcon } from "@/components/SortIcon";

type UserRow = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  organizationId: number | null;
  organization?: { id: number; name: string } | null;
  createdAt?: string;
};

type SortKey = "id" | "name" | "email" | "role" | "organization";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  //Search, paginations and Sorting state
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
  } = useClientTable<UserRow, SortKey>({
    data: users,
    initialSortKey: "id",
    searchKeys: (u) => [
      u.name || "",
      u.email,
      u.role,
      u.organization?.name || "",
    ],
    getSortValue: (u, key) => {
      switch (key) {
        case "id":
          return u.id;
        case "name":
          return (u.name || "").toLowerCase();
        case "email":
          return u.email.toLowerCase();
        case "role":
          return u.role.toLowerCase();
        case "organization":
          return (u.organization?.name || "").toLowerCase();
      }
    },
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load users");
      }
      setUsers(json.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUsers();
    };

    init();
  }, []);

  const refreshUsers = async () => {
    setLoading(true);
    await fetchUsers();
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserRow) => {
    setModalMode("edit");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSuccess = () => {
    closeModal();
    void refreshUsers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete");
      }
      void refreshUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage admin and reviewer accounts
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Toolbar: Show entries + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              placeholder="Search users..."
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 w-64 sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading users...
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
                  <tr className="bg-slate-800/70 text-slate-300 text-left">
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

                    {/* Name */}
                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("name")}
                        className="inline-flex items-center gap-1.5 hover:text-white transition"
                      >
                        Name
                        <SortIcon
                          column="name"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    {/* Email */}
                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("email")}
                        className="inline-flex items-center gap-1.5 hover:text-white transition"
                      >
                        Email
                        <SortIcon
                          column="email"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    {/* Role */}
                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("role")}
                        className="inline-flex items-center gap-1.5 hover:text-white transition"
                      >
                        Role
                        <SortIcon
                          column="role"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    {/* Organization */}
                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("organization")}
                        className="inline-flex items-center gap-1.5 hover:text-white transition"
                      >
                        Organization
                        <SortIcon
                          column="organization"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    {/* Actions — not sortable */}
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-slate-500"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Users size={32} className="text-slate-600" />
                          <p>
                            {search.trim()
                              ? "No users match your search."
                              : "No users found."}
                          </p>
                          {!search.trim() && (
                            <button
                              onClick={openCreateModal}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Create the first user
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((user, index) => {
                      const serialNumber =
                        (currentPage - 1) * pageSize + index + 1;
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-5 py-3 font-mono text-slate-400">
                            {serialNumber}
                          </td>
                          <td className="px-5 py-3 font-medium text-white">
                            {user.name || "—"}
                          </td>
                          <td className="px-5 py-3 text-slate-300">
                            {user.email}
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-300">
                            {user.organization?.name || "—"}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">

                              {/** View user button */}
                              <button
                                onClick={() => openEditModal(user)}
                                className="text-blue-400 hover:text-blue-300 cursor-pointer"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>

                              {/** View patient */}
                              <button
                                // onClick={() => openEditModal(org)}
                                className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors cursor-pointer"
                                title="view patient"
                              >
                                <UserShield size={15} />
                              </button>

                              {/** Delete user button */}
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="text-red-400 hover:text-red-300 cursor-pointer"
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

            {/* Footer*/}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-slate-800 text-sm text-slate-400">
              <div>
                {totalItems === 0
                  ? "Showing 0 entries"
                  : `Showing ${endEntry} of ${totalItems} entries`}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                  Pre
                </button>

                <span className="px-2 text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={goToNext}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Nxt
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">
                {modalMode === "create" ? "Add User" : "Edit User"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <UserForm
                mode={modalMode}
                userId={selectedUser?.id}
                initialData={
                  selectedUser
                    ? {
                        email: selectedUser.email,
                        name: selectedUser.name || "",
                        role: selectedUser.role,
                        organizationId:
                          selectedUser.organizationId != null
                            ? String(selectedUser.organizationId)
                            : "",
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
