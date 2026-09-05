"use client";

import { useEffect, useState } from "react";
import {
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  UserRoundCheck,
} from "lucide-react";
import {
  PriorAuthReviewSummary,
  CriteriaOverride,
} from "@/types/priorAuthResponse.dto";

interface ReviewHistoryProps {
  patientId?: number; // optional – if provided, filters to that patient
}

const decisionStyles: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  APPROVED: {
    label: "Approved",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  DENIED: {
    label: "Denied",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: <XCircle className="h-4 w-4" />,
  },
  REQUEST_ADDITIONAL_INFO: {
    label: "Request Additional Info",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

export default function ReviewHistory({ patientId }: ReviewHistoryProps) {
  const [reviews, setReviews] = useState<PriorAuthReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = patientId
          ? `/api/prior-auth/review?patientId=${encodeURIComponent(patientId)}`
          : "/api/prior-auth/review";

        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to load reviews");
        }

        setReviews(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [patientId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-sm text-gray-500 dark:text-slate-400">
        Loading review history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-6 text-sm text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-8 text-center text-sm text-gray-500 dark:text-slate-400">
        No past reviews found{patientId ? ` for patient ${patientId}` : ""}.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
        <History className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Review History
          {patientId && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-slate-400">
              · {patientId}
            </span>
          )}
        </h2>
        <span className="ml-auto rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          {reviews.length}
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
        {reviews.map((review) => {
          const decision =
            decisionStyles[review.finalDecision] ??
            decisionStyles.REQUEST_ADDITIONAL_INFO;
          const isExpanded = expandedId === review.id;
          const overrides = (review.overridesJson ?? []) as CriteriaOverride[];

          return (
            <div key={review.id} className="px-6 py-4">
              {/* Summary row */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : review.id)}
                className="flex w-full items-start gap-4 text-left"
              >
                <div className="mt-1 text-slate-400">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${decision.bg} ${decision.text}`}
                    >
                      {decision.icon}
                      {decision.label}
                    </span>

                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {new Date(review.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-gray-700 dark:text-slate-300">
                    Agent recommendation:{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {review.agentRecommendation}
                    </span>
                  </p>

                  {overrides.length > 0 && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <UserRoundCheck className="h-3.5 w-3.5" />
                      {overrides.length} criteria override
                      {overrides.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="mt-4 ml-8 space-y-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
                  {/* Meta */}
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Patient ID
                      </p>
                      <p className="mt-0.5 font-mono text-gray-900 dark:text-white">
                        {review.patientId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Agent Status
                      </p>
                      <p className="mt-0.5 text-gray-900 dark:text-white">
                        {review.agentStatus}
                      </p>
                    </div>
                    {review.reviewerNote && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Reviewer Note
                        </p>
                        <p className="mt-0.5 text-gray-700 dark:text-slate-300">
                          {review.reviewerNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Overrides */}
                  {overrides.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Human Overrides
                      </p>
                      <div className="space-y-2">
                        {overrides.map((o) => (
                          <div
                            key={o.criteriaId}
                            className="rounded-md border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-800 p-3 text-sm"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {o.criteriaId}
                              </span>
                              <span className="text-xs text-slate-500">
                                {o.originalSatisfied ? "Met" : "Not Met"} →{" "}
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  {o.overriddenSatisfied ? "Met" : "Not Met"}
                                </span>
                              </span>
                            </div>
                            <p className="mt-1.5 text-gray-600 dark:text-slate-300">
                              {o.justification}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      No criteria were overridden in this review.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
