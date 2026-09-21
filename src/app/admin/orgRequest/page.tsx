"use client";

import { useEffect, useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
} from "lucide-react";
import { useClientTable } from "@/hooks/useClientTable";
import { SortIcon } from "@/components/SortIcon";
import { RequestDetailModal } from "@/components/admin/RequestDetailModal";
import {
  AccessRequestStatus,
  IAccessRequest,
  RequiredLicence,
} from "@/types/access-request.entity";
import { OrgType } from "@/types/organizations.entity";

type SortKey =
  | "id"
  | "organizationName"
  | "domainName"
  | "email"
  | "type"
  | "numOfLicenceRequired"
  | "status"
  | "createdAt";

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

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ---------- Main Component ----------
export default function OrganizationAccessRequest() {
  const [requests, setRequests] = useState<IAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccessRequestStatus | "ALL">(
    "ALL",
  );
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<IAccessRequest | null>(
    null,
  );

  // Apply status filter first, then hand the result to useClientTable
  const statusFilteredRequests =
    statusFilter === "ALL"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

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
    endEntry,
    goToPrevious,
    goToNext,
  } = useClientTable<IAccessRequest, SortKey>({
    data: statusFilteredRequests,
    initialSortKey: "id",
    searchKeys: (req) => [
      req.organizationName,
      req.domainName,
      req.email,
      req.phone,
      req.type,
      req.status,
      licenceLabel[req.numOfLicenceRequired],
    ],
    getSortValue: (req, key) => {
      switch (key) {
        case "id":
          return req.id;
        case "organizationName":
          return req.organizationName.toLowerCase();
        case "domainName":
          return req.domainName.toLowerCase();
        case "email":
          return req.email.toLowerCase();
        case "type":
          return req.type.toLowerCase();
        case "numOfLicenceRequired":
          return req.numOfLicenceRequired;
        case "status":
          return req.status;
        case "createdAt":
          return new Date(req.createdAt).getTime();
        default:
          return "";
      }
    },
  });

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

  // Approve / Reject (Now accepts adminNote from the modal)
  const handleStatusUpdate = async (
    id: number,
    newStatus: "APPROVED" | "REJECTED",
    adminNote: string = "",
  ) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/request-access/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Added adminNotes to the payload
        body: JSON.stringify({ status: newStatus, adminNotes: adminNote }),
      });

      const json = await res.json();
      if (json.success) {
        const now = new Date();

        // Update the main table state
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: newStatus,
                  updatedAt: now,
                  adminNotes: adminNote,
                }
              : r,
          ),
        );

        // Update the currently opened modal state so it transitions seamlessly
        setSelectedRequest((prev) =>
          prev && prev.id === id
            ? { ...prev, status: newStatus, adminNotes: adminNote }
            : prev,
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-0">
          <div className="flex flex-wrap items-center gap-3">
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

            {/* Status filter pills */}
            <div className="flex gap-1.5">
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

          <div className="relative w-full sm:w-auto">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizations, email..."
              className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading requests...
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
                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("id")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
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
                        onClick={() => handleSort("organizationName")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Organization
                        <SortIcon
                          column="organizationName"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort("domainName")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Domain
                        <SortIcon
                          column="domainName"
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
                        onClick={() => handleSort("numOfLicenceRequired")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Licences
                        <SortIcon
                          column="numOfLicenceRequired"
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
                        onClick={() => handleSort("createdAt")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Requested On
                        <SortIcon
                          column="createdAt"
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                        />
                      </button>
                    </th>

                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Building2
                            size={32}
                            className="text-slate-400 dark:text-slate-600"
                          />
                          <p>
                            {search.trim() || statusFilter !== "ALL"
                              ? "No access requests match your filters."
                              : "No access requests found."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((req, index) => {
                      const serialNumber =
                        (currentPage - 1) * pageSize + index + 1;
                      const status = statusConfig[req.status];

                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-5 py-3 font-mono text-blue-600 dark:text-blue-400 font-medium">
                            {serialNumber}
                          </td>

                          <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                            {req.organizationName}
                          </td>

                          <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                            {req.domainName}
                          </td>

                          <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                            {req.email}
                          </td>

                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeClass[req.type]}`}
                            >
                              {req.type}
                            </span>
                          </td>

                          <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                            {licenceLabel[req.numOfLicenceRequired]}
                          </td>

                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </td>

                          <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                            {formatDate(req.createdAt)}
                          </td>

                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {/* ONLY the View Details button is left here */}
                              <button
                                title="View details"
                                onClick={() => setSelectedRequest(req)}
                                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                              >
                                <Eye size={16} />
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

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          // Pass the adminNote from the modal callback to the handler
          onApprove={(adminNote) =>
            handleStatusUpdate(selectedRequest.id, "APPROVED", adminNote)
          }
          onReject={(adminNote) =>
            handleStatusUpdate(selectedRequest.id, "REJECTED", adminNote)
          }
          isActioning={actionLoading === selectedRequest.id}
        />
      )}
    </>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import {
//   Search,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   Eye,
//   ChevronLeft,
//   ChevronRight,
//   Loader2,
//   Building2,
// } from "lucide-react";
// import { useClientTable } from "@/hooks/useClientTable";
// import { SortIcon } from "@/components/SortIcon";
// import { RequestDetailModal } from "@/components/admin/RequestDetailModal";
// import {
//   AccessRequestStatus,
//   IAccessRequest,
//   RequiredLicence,
// } from "@/types/access-request.entity";
// import { OrgType } from "@/types/organizations.entity";

// type SortKey =
//   | "id"
//   | "organizationName"
//   | "domainName"
//   | "email"
//   | "type"
//   | "numOfLicenceRequired"
//   | "status"
//   | "createdAt";

// // ---------- Helpers ----------
// const licenceLabel: Record<RequiredLicence, string> = {
//   LESS_THAN_100: "< 100",
//   BETWEEN_100_500: "100 – 500",
//   MORE_THAN_500: "500+",
// };

// const statusConfig: Record<
//   AccessRequestStatus,
//   { label: string; className: string; icon: React.ReactNode }
// > = {
//   PENDING: {
//     label: "PENDING",
//     className:
//       "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
//     icon: <Clock className="h-3.5 w-3.5" />,
//   },
//   APPROVED: {
//     label: "APPROVED",
//     className:
//       "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
//     icon: <CheckCircle2 className="h-3.5 w-3.5" />,
//   },
//   REJECTED: {
//     label: "REJECTED",
//     className:
//       "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
//     icon: <XCircle className="h-3.5 w-3.5" />,
//   },
// };

// const typeBadgeClass: Record<OrgType, string> = {
//   HOSPITAL: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
//   CLINIC: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
//   OTHERS: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
//   DEMO: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
// };

// function formatDate(iso: string | Date) {
//   return new Date(iso).toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// // ---------- Main Component ----------
// export default function OrganizationAccessRequest() {
//   const [requests, setRequests] = useState<IAccessRequest[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [statusFilter, setStatusFilter] = useState<AccessRequestStatus | "ALL">(
//     "ALL",
//   );
//   const [actionLoading, setActionLoading] = useState<number | null>(null);
//   const [selectedRequest, setSelectedRequest] = useState<IAccessRequest | null>(
//     null,
//   );

//   // Apply status filter first, then hand the result to useClientTable
//   const statusFilteredRequests =
//     statusFilter === "ALL"
//       ? requests
//       : requests.filter((r) => r.status === statusFilter);

//   const {
//     search,
//     setSearch,
//     pageSize,
//     setPageSize,
//     pageSizeOptions,
//     currentPage,
//     sortKey,
//     sortDirection,
//     handleSort,
//     paginatedData,
//     totalItems,
//     totalPages,
//     endEntry,
//     goToPrevious,
//     goToNext,
//   } = useClientTable<IAccessRequest, SortKey>({
//     data: statusFilteredRequests,
//     initialSortKey: "id",
//     searchKeys: (req) => [
//       req.organizationName,
//       req.domainName,
//       req.email,
//       req.phone,
//       req.type,
//       req.status,
//       licenceLabel[req.numOfLicenceRequired],
//     ],
//     getSortValue: (req, key) => {
//       switch (key) {
//         case "id":
//           return req.id;
//         case "organizationName":
//           return req.organizationName.toLowerCase();
//         case "domainName":
//           return req.domainName.toLowerCase();
//         case "email":
//           return req.email.toLowerCase();
//         case "type":
//           return req.type.toLowerCase();
//         case "numOfLicenceRequired":
//           return req.numOfLicenceRequired;
//         case "status":
//           return req.status;
//         case "createdAt":
//           return new Date(req.createdAt).getTime();
//         default:
//           return "";
//       }
//     },
//   });

//   // Fetch data
//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch("/api/request-access");
//         const json = await res.json();

//         if (json.success) {
//           setRequests(json.data || []);
//         } else {
//           setError(json.error || "Failed to load requests");
//         }
//       } catch {
//         setError("Something went wrong while fetching requests");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRequests();
//   }, []);

//   // Approve / Reject
//   const handleStatusUpdate = async (
//     id: number,
//     newStatus: "APPROVED" | "REJECTED",
//   ) => {
//     setActionLoading(id);
//     try {
//       const res = await fetch(`/api/request-access/${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       const json = await res.json();
//       if (json.success) {
//         const now = new Date();
//         setRequests((prev) =>
//           prev.map((r) =>
//             r.id === id
//               ? {
//                   ...r,
//                   status: newStatus,
//                   updatedAt: now,
//                 }
//               : r,
//           ),
//         );
//         setSelectedRequest((prev) =>
//           prev && prev.id === id ? { ...prev, status: newStatus } : prev,
//         );
//       } else {
//         alert(json.error || "Failed to update status");
//       }
//     } catch {
//       alert("Something went wrong");
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   return (
//     <>
//       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
//         {/* Toolbar */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-0">
//           <div className="flex flex-wrap items-center gap-3">
//             <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
//               <span>Show</span>
//               <select
//                 value={pageSize}
//                 onChange={(e) => setPageSize(Number(e.target.value))}
//                 className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
//               >
//                 {pageSizeOptions.map((size) => (
//                   <option key={size} value={size}>
//                     {size}
//                   </option>
//                 ))}
//               </select>
//               <span>entries</span>
//             </div>

//             {/* Status filter pills */}
//             <div className="flex gap-1.5">
//               {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(
//                 (s) => (
//                   <button
//                     key={s}
//                     onClick={() => setStatusFilter(s)}
//                     className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
//                       statusFilter === s
//                         ? "bg-blue-600 text-white"
//                         : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
//                     }`}
//                   >
//                     {s}
//                   </button>
//                 ),
//               )}
//             </div>
//           </div>

//           <div className="relative w-full sm:w-auto">
//             <Search
//               size={16}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
//             />
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search organizations, email..."
//               className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//             />
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">
//             <Loader2 className="animate-spin mr-2" size={20} />
//             Loading requests...
//           </div>
//         ) : error ? (
//           <div className="flex items-center justify-center py-20 text-red-600 dark:text-red-400">
//             {error}
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-left transition-colors">
//                     <th className="px-5 py-3 font-medium">
//                       <button
//                         type="button"
//                         onClick={() => handleSort("id")}
//                         className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
//                       >
//                         Sr. No.
//                         <SortIcon
//                           column="id"
//                           sortKey={sortKey}
//                           sortDirection={sortDirection}
//                         />
//                       </button>
//                     </th>

//                     <th className="px-5 py-3 font-medium">
//                       <button
//                         type="button"
//                         onClick={() => handleSort("organizationName")}
//                         className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
//                       >
//                         Organization
//                         <SortIcon
//                           column="organizationName"
//                           sortKey={sortKey}
//                           sortDirection={sortDirection}
//                         />
//                       </button>
//                     </th>

//                     <th className="px-5 py-3 font-medium">
//                       <button
//                         type="button"
//                         onClick={() => handleSort("domainName")}
//                         className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
//                       >
//                         Domain
//                         <SortIcon
//                           column="domainName"
//                           sortKey={sortKey}
//                           sortDirection={sortDirection}
//                         />
//                       </button>
//                     </th>

//                     <th className="px-5 py-3 font-medium">
//                       <button
//                         type="button"
//                         onClick={() => handleSort("email")}
//                         className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
//                       >
//                         Email
//                         <SortIcon
//                           column="email"
//                           sortKey={sortKey}
//                           sortDirection={sortDirection}
//                         />
//                       </button>
//                     </th>

//                     <th className="px-5 py-3 font-medium">
//                       <button
//                         type="button"
//                         onClick={() => handleSort("type")}
//                         className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
//                       >
//                         Type
//                         <SortIcon
//                           column="type"
//                           sortKey={sortKey}
//                           sortDirection={sortDirection}
//                         />
//                       </button>
//                     </th>

//                     <th className="px-5 py-3 font-medium">
//                       <button
//                         type="button"
//                         onClick={() => handleSort("numOfLicenceRequired")}
//                         className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
//                       >
//                         Licences
//                         <SortIcon
//                           column="numOfLicenceRequired"
//                           sortKey={sortKey}
//                           sortDirection={sortDirection}
//                         />
//                       </button>
//                     </th>

//                     <th className="px-5 py-3 font-medium">
//                       <button
//                         type="button"
//                         onClick={() => handleSort("status")}
//                         className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
//                       >
//                         Status
//                         <SortIcon
//                           column="status"
//                           sortKey={sortKey}
//                           sortDirection={sortDirection}
//                         />
//                       </button>
//                     </th>

//                     <th className="px-5 py-3 font-medium">
//                       <button
//                         type="button"
//                         onClick={() => handleSort("createdAt")}
//                         className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
//                       >
//                         Requested On
//                         <SortIcon
//                           column="createdAt"
//                           sortKey={sortKey}
//                           sortDirection={sortDirection}
//                         />
//                       </button>
//                     </th>

//                     <th className="px-5 py-3 font-medium text-right">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
//                   {paginatedData.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={9}
//                         className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
//                       >
//                         <div className="flex flex-col items-center gap-3">
//                           <Building2
//                             size={32}
//                             className="text-slate-400 dark:text-slate-600"
//                           />
//                           <p>
//                             {search.trim() || statusFilter !== "ALL"
//                               ? "No access requests match your filters."
//                               : "No access requests found."}
//                           </p>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     paginatedData.map((req, index) => {
//                       const serialNumber =
//                         (currentPage - 1) * pageSize + index + 1;
//                       const status = statusConfig[req.status];
//                       const isActioning = actionLoading === req.id;

//                       return (
//                         <tr
//                           key={req.id}
//                           className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
//                         >
//                           <td className="px-5 py-3 font-mono text-blue-600 dark:text-blue-400 font-medium">
//                             {serialNumber}
//                           </td>

//                           <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
//                             {req.organizationName}
//                           </td>

//                           <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
//                             {req.domainName}
//                           </td>

//                           <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
//                             {req.email}
//                           </td>

//                           <td className="px-5 py-3">
//                             <span
//                               className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeClass[req.type]}`}
//                             >
//                               {req.type}
//                             </span>
//                           </td>

//                           <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
//                             {licenceLabel[req.numOfLicenceRequired]}
//                           </td>

//                           <td className="px-5 py-3">
//                             <span
//                               className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
//                             >
//                               {status.icon}
//                               {status.label}
//                             </span>
//                           </td>

//                           <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
//                             {formatDate(req.createdAt)}
//                           </td>

//                           <td className="px-5 py-3">
//                             <div className="flex items-center justify-end gap-2">
//                               <button
//                                 title="View details"
//                                 onClick={() => setSelectedRequest(req)}
//                                 className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
//                               >
//                                 <Eye size={15} />
//                               </button>

//                               {req.status === "PENDING" && (
//                                 <>
//                                   <button
//                                     disabled={isActioning}
//                                     onClick={() =>
//                                       handleStatusUpdate(req.id, "APPROVED")
//                                     }
//                                     title="Approve"
//                                     className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 disabled:opacity-50 transition-colors"
//                                   >
//                                     {isActioning ? (
//                                       <Loader2
//                                         size={15}
//                                         className="animate-spin"
//                                       />
//                                     ) : (
//                                       <CheckCircle2 size={15} />
//                                     )}
//                                   </button>

//                                   <button
//                                     disabled={isActioning}
//                                     onClick={() =>
//                                       handleStatusUpdate(req.id, "REJECTED")
//                                     }
//                                     title="Reject"
//                                     className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 disabled:opacity-50 transition-colors"
//                                   >
//                                     <XCircle size={15} />
//                                   </button>
//                                 </>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Footer */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
//               <div>
//                 {totalItems === 0
//                   ? "Showing 0 entries"
//                   : `Showing ${endEntry} of ${totalItems} entries`}
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={goToPrevious}
//                   disabled={currentPage <= 1}
//                   className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
//                 >
//                   <ChevronLeft size={16} />
//                   Previous
//                 </button>

//                 <span className="px-2 text-slate-700 dark:text-slate-300">
//                   Page {currentPage} of {totalPages}
//                 </span>

//                 <button
//                   onClick={goToNext}
//                   disabled={currentPage >= totalPages}
//                   className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
//                 >
//                   Next
//                   <ChevronRight size={16} />
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Detail Modal */}
//       {selectedRequest && (
//         <RequestDetailModal
//           request={selectedRequest}
//           onClose={() => setSelectedRequest(null)}
//           onApprove={() => handleStatusUpdate(selectedRequest.id, "APPROVED")}
//           onReject={() => handleStatusUpdate(selectedRequest.id, "REJECTED")}
//           isActioning={actionLoading === selectedRequest.id}
//         />
//       )}
//     </>
//   );
// }
