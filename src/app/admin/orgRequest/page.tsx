"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  FileText,
} from "lucide-react";

// ---------- Types ----------
type AccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
type OrgType = "DEMO" | "HOSPITAL" | "CLINIC" | "OTHERS";
type RequiredLicence = "LESS_THAN_100" | "BETWEEN_100_500" | "MORE_THAN_500";

interface AccessRequest {
  id: number;
  organizationName: string;
  domainName: string;
  email: string;
  phone: string;
  address: string;
  type: OrgType;
  numOfLicenceRequired: RequiredLicence;
  status: AccessRequestStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedBy: string | null;
}

// ---------- Helpers ----------
const licenceLabel: Record<RequiredLicence, string> = {
  LESS_THAN_100: "< 100",
  BETWEEN_100_500: "100 – 500",
  MORE_THAN_500: "500+",
};

const statusConfig: Record<
  AccessRequestStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "PENDING",
    className:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  APPROVED: {
    label: "APPROVED",
    className:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  REJECTED: {
    label: "REJECTED",
    className:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const typeBadgeClass: Record<OrgType, string> = {
  HOSPITAL: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  CLINIC: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  OTHERS: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  DEMO: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------- Detail Modal ----------
function RequestDetailModal({
  request,
  onClose,
  onApprove,
  onReject,
  isActioning,
}: {
  request: AccessRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isActioning: boolean;
}) {
  const status = statusConfig[request.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Access Request Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ID: #{request.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Status
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
            >
              {status.icon}
              {status.label}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Organization */}
            <div className="flex gap-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Organization
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {request.organizationName}
                </p>
              </div>
            </div>

            {/* Domain */}
            <div className="flex gap-3">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Domain
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {request.domainName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Email
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {request.email}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Phone
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {request.phone}
                </p>
              </div>
            </div>

            {/* Type */}
            <div className="flex gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Type
                </p>
                <span
                  className={`mt-0.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeClass[request.type]}`}
                >
                  {request.type}
                </span>
              </div>
            </div>

            {/* Licences */}
            <div className="flex gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Licences Required
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {licenceLabel[request.numOfLicenceRequired]}
                </p>
              </div>
            </div>
          </div>

          {/* Address - full width */}
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Address
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {request.address}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Requested On
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {formatDateTime(request.createdAt)}
                </p>
              </div>
            </div>

            {request.reviewedBy && (
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Reviewed By
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {request.reviewedBy}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Admin Notes */}
          {request.adminNotes && (
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Admin Notes
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {request.adminNotes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {request.status === "PENDING" && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              disabled={isActioning}
              onClick={onReject}
              className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors"
            >
              {isActioning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject
            </button>

            <button
              disabled={isActioning}
              onClick={onApprove}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {isActioning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Approve
            </button>
          </div>
        )}

        {request.status !== "PENDING" && (
          <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-700">
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Main Table Component ----------
export default function OrganizationAccessRequest() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccessRequestStatus | "ALL">(
    "ALL",
  );
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(
    null,
  );

  // Fetch data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/request-access");
        const json = await res.json();

        if (json.success) {
          setRequests(json.data || []);
        } else {
          setError(json.error || "Failed to load requests");
        }
      } catch {
        setError("Something went wrong while fetching requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter + search
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.organizationName.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase()) ||
        r.domainName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  // Approve / Reject
  const handleStatusUpdate = async (
    id: number,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/request-access/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (json.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : r,
          ),
        );
        // Also update the modal if it's open
        setSelectedRequest((prev) =>
          prev && prev.id === id ? { ...prev, status: newStatus } : prev,
        );
      } else {
        alert(json.error || "Failed to update status");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60 dark:shadow-xl">
        {/* Header controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Show
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              entries
            </span>

            {/* Status filter pills */}
            <div className="ml-2 flex gap-1.5">
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      statusFilter === s
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizations, email..."
              className="w-64 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Sr. No.</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Domain</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Licences</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Requested On</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-500" />
                    <p className="mt-2 text-slate-500">Loading requests...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-rose-500 dark:text-rose-400"
                  >
                    {error}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No access requests found
                  </td>
                </tr>
              ) : (
                paginated.map((req, idx) => {
                  const status = statusConfig[req.status];
                  const isActioning = actionLoading === req.id;

                  return (
                    <tr
                      key={req.id}
                      className="bg-white hover:bg-slate-50 transition-colors dark:bg-slate-900/40 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      {/* Organization Name only */}
                      <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white">
                        {req.organizationName}
                      </td>

                      {/* Domain Name only */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {req.domainName}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {req.email}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeClass[req.type]}`}
                        >
                          {req.type}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {licenceLabel[req.numOfLicenceRequired]}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {formatDate(req.createdAt)}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            title="View details"
                            onClick={() => setSelectedRequest(req)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Quick Approve / Reject (only when PENDING) */}
                          {req.status === "PENDING" && (
                            <>
                              <button
                                disabled={isActioning}
                                onClick={() =>
                                  handleStatusUpdate(req.id, "APPROVED")
                                }
                                title="Approve"
                                className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                              >
                                {isActioning ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                              </button>

                              <button
                                disabled={isActioning}
                                onClick={() =>
                                  handleStatusUpdate(req.id, "REJECTED")
                                }
                                title="Reject"
                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div>
            Showing{" "}
            <span className="font-medium text-slate-800 dark:text-white">
              {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-800 dark:text-white">
              {Math.min(currentPage * pageSize, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-800 dark:text-white">
              {filtered.length}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-600 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Pre
            </button>

            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-600 dark:hover:bg-slate-800 transition-colors"
            >
              Nxt <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => handleStatusUpdate(selectedRequest.id, "APPROVED")}
          onReject={() => handleStatusUpdate(selectedRequest.id, "REJECTED")}
          isActioning={actionLoading === selectedRequest.id}
        />
      )}
    </>
  );
}
