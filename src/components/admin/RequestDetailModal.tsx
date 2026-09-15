"use client";

import { useState } from "react";
import {
  AccessRequestStatus,
  IAccessRequest,
  RequiredLicence,
} from "@/types/access-request.entity";
import { OrgType } from "@/types/organizations.entity";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  X,
  XCircle,
} from "lucide-react";

export function RequestDetailModal({
  request,
  onClose,
  onApprove,
  onReject,
  isActioning,
}: {
  request: IAccessRequest;
  onClose: () => void;
  onApprove: (adminNote: string) => void;
  onReject: (adminNote: string) => void;
  isActioning: boolean;
}) {
  const status = statusConfig[request.status];
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState("");

  const handleReject = () => {
    if (!adminNote.trim()) {
      setError("An admin note is required to reject this request.");
      return;
    }
    setError("");
    onReject(adminNote.trim());
  };

  const handleApprove = () => {
    setError("");
    onApprove(adminNote.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#0f172a]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Access Request Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ID: #{request.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 px-6 py-5 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Status
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${status.className}`}
            >
              {status.icon}
              {status.label}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* ... Existing Grid Details (Organization, Domain, Email, Phone, Type, Licenses) ... */}
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

          {/* Admin Notes Section */}
          {request.status === "PENDING" ? (
            <div className="flex flex-col gap-2 pt-2">
              <label
                htmlFor="adminNote"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Admin Notes{" "}
                <span className="text-rose-500">
                  * (Required for rejection)
                </span>
              </label>
              <textarea
                id="adminNote"
                rows={3}
                placeholder="Enter remarks regarding approval or rejection..."
                value={adminNote}
                onChange={(e) => {
                  setAdminNote(e.target.value);
                  if (error) setError("");
                }}
                className={`w-full resize-none rounded-xl border bg-slate-50 p-3 text-sm text-slate-900 outline-none transition-all dark:bg-slate-800/50 dark:text-white ${
                  error
                    ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {error && (
                <p className="text-xs font-medium text-rose-500">{error}</p>
              )}
            </div>
          ) : (
            request.adminNotes && (
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Admin Notes
                </p>
                <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">
                  {request.adminNotes}
                </p>
              </div>
            )
          )}
        </div>

        {/* Footer Actions */}
        {request.status === "PENDING" ? (
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-2xl">
            <button
              onClick={onClose}
              disabled={isActioning}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              disabled={isActioning}
              onClick={handleReject}
              className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-transparent px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 disabled:opacity-50 transition-colors"
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
              onClick={handleApprove}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {isActioning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Approve
            </button>
          </div>
        ) : (
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

function formatDateTime(iso: string | Date) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

const licenceLabel: Record<RequiredLicence, string> = {
  LESS_THAN_100: "< 100",
  BETWEEN_100_500: "100 – 500",
  MORE_THAN_500: "500+",
};

const typeBadgeClass: Record<OrgType, string> = {
  HOSPITAL: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  CLINIC: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  OTHERS: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  DEMO: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
};
