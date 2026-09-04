"use client";

import { useState } from "react";
import {
  Brain,
  FileSearch,
  CheckCircle2,
  XCircle,
  UserRoundCheck,
} from "lucide-react";
import ExecutionTraceDrawer from "./ExecutionTraceDrawer";
import EvidenceDrawer from "./EvidenceDrawer";
// import {
//   EvidenceItem,
//   ExecutionStep,
//   CriterionEvaluation,
//   // PriorAuthResponse,
// } from "@/types/prior-auth-response";
import { PriorAuthResponse } from "@/types/agentState.dto";
import {
  CriterionEvaluation,
  EvidenceItem,
  ExecutionStep,
} from "@/types/tools.dto";

interface RecommendationPanelProps {
  result: PriorAuthResponse;
  recommendation: string;
  status: string;
  trace: ExecutionStep[];
  evidence: EvidenceItem[];
  criteria: CriterionEvaluation[];
}

interface OverrideState {
  originalSatisfied: boolean;
  satisfied: boolean;
  justification: string;
  overridden: boolean;
}

export default function RecommendationPanel({
  result,
  recommendation,
  status,
  trace,
  evidence,
  criteria,
}: RecommendationPanelProps) {
  const [showTrace, setShowTrace] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const [overrides, setOverrides] = useState<Record<string, OverrideState>>({});
  const [activeOverride, setActiveOverride] = useState<string | null>(null);
  const [justification, setJustification] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const finalRecommendation = trace.find(
    (step) => step.type === "reasoner" && step.title === "Final Recommendation",
  );

  // Recommendation Colors
  const isApproved = recommendation.toLowerCase().includes("approved");
  const isManualReview = recommendation.toLowerCase().includes("manual review");
  const recommendationColor = isApproved
    ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/50"
    : isManualReview
      ? "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/50"
      : "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50";

  // Status Colors
  const statusColor =
    status === "completed"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";

  // Override helpers
  function getCriterionState(criterion: CriterionEvaluation) {
    const override = overrides[criterion.id];
    if (override) {
      return {
        satisfied: override.satisfied,
        overridden: override.overridden,
      };
    }
    return {
      satisfied: criterion.satisfied,
      overridden: false,
    };
  }

  function startOverride(criterionId: string) {
    setActiveOverride(criterionId);
    setJustification("");
  }

  function cancelOverride() {
    setActiveOverride(null);
    setJustification("");
  }

  function applyOverride(criterion: CriterionEvaluation) {
    if (!justification.trim()) {
      return;
    }
    setOverrides((current) => ({
      ...current,
      [criterion.id]: {
        originalSatisfied: criterion.satisfied,
        satisfied: true,
        justification: justification.trim(),
        overridden: true,
      },
    }));
    setActiveOverride(null);
    setJustification("");
  }

  async function submitReview(
    decision: "APPROVED" | "DENIED" | "REQUEST_ADDITIONAL_INFO",
  ) {
    if (!result) return; // you will need to pass the full result down or keep it in parent

    setIsSubmitting(true);
    setSubmitMessage(null);

    const overrideList = Object.entries(overrides).map(([criteriaId, o]) => ({
      criteriaId,
      originalSatisfied: o.originalSatisfied,
      overriddenSatisfied: o.satisfied,
      justification: o.justification,
    }));

    try {
      const res = await fetch("/api/prior-auth/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentResult: result, // full PriorAuthResponse
          overrides: overrideList,
          decision,
          // reviewerNote: optional free text if add a note field
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to save review");
      }

      setSubmitMessage(`Review saved (${decision}). ID: ${data.data.reviewId}`);
    } catch (err) {
      setSubmitMessage(
        err instanceof Error ? err.message : "Failed to save review",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-colors duration-200">
      {/*HEADER*/}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Final Recommendation
        </h2>
        <div className="flex gap-3">
          {/* Execution Trace */}
          <button
            onClick={() => setShowTrace(true)}
            className="rounded-lg border border-gray-200 dark:border-slate-600 p-2 transition hover:bg-gray-100 dark:hover:bg-slate-700"
            title="Agent Execution Trace"
          >
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </button>
          {/* Evidence */}
          <button
            onClick={() => setShowEvidence(true)}
            className="rounded-lg border border-gray-200 dark:border-slate-600 p-2 transition hover:bg-gray-100 dark:hover:bg-slate-700"
            title="Collected Evidence"
          >
            <FileSearch className="h-5 w-5 text-green-600 dark:text-green-400" />
          </button>
        </div>
      </div>

      {/* RECOMMENDATION BADGES */}
      <div className="mb-6 flex flex-wrap items-start gap-8">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500 dark:text-slate-400">
            Investigation Status
          </p>
          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${statusColor}`}
          >
            {status}
          </span>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-500 dark:text-slate-400">
            Outcome
          </p>
          <span
            className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${recommendationColor}`}
          >
            {recommendation}
          </span>
        </div>
      </div>

      {/* DETAILED RATIONALE BOX */}
      {finalRecommendation?.content && (
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-gray-500 dark:text-slate-400">
            Recommendation Details
          </p>
          <div
            className={`rounded-xl border p-5 text-sm leading-relaxed shadow-inner ${recommendationColor}`}
          >
            {/* whitespace-pre-wrap ensures natural line breaks from the AI are respected */}
            <p className="whitespace-pre-wrap font-medium">
              {finalRecommendation.content}
            </p>
          </div>
        </div>
      )}

      {/* POLICY CRITERIA */}
      <div className="mt-10">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Policy Criteria
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Review the evidence supporting each authorization criterion.
          </p>
        </div>

        <div className="space-y-4">
          {criteria.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-slate-600 p-5 text-center text-sm text-gray-500 dark:text-slate-400">
              No policy criteria available.
            </div>
          ) : (
            criteria.map((criterion) => {
              const criterionState = getCriterionState(criterion);
              const isOverridden = criterionState.overridden;
              const isSatisfied = criterionState.satisfied;
              const isEditing = activeOverride === criterion.id;

              return (
                <div
                  key={criterion.id}
                  className={`rounded-xl border p-5 transition-colors ${
                    isOverridden
                      ? "border-blue-300 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/20"
                      : isSatisfied
                        ? "border-green-200 bg-green-50 dark:border-green-800/60 dark:bg-green-900/20"
                        : "border-yellow-200 bg-yellow-50 dark:border-yellow-800/60 dark:bg-yellow-900/20"
                  }`}
                >
                  {/* Criterion header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      {isSatisfied ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
                      )}

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {criterion.criterion}
                        </h4>

                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                          {criterion.explanation}
                        </p>
                      </div>
                    </div>
                    {/* Status badge */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isSatisfied
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {isSatisfied ? "Met" : "Not Met"}
                      </span>

                      {isOverridden && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                          <UserRoundCheck className="h-3.5 w-3.5" />
                          Human Override
                        </span>
                      )}
                    </div>
                  </div>

                  {/* OVERRIDE BUTTON*/}
                  {!isSatisfied && !isEditing && (
                    <div className="mt-4 border-t border-yellow-200 dark:border-yellow-800/50 pt-4">
                      <button
                        type="button"
                        onClick={() => startOverride(criterion.id)}
                        className="rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 transition hover:bg-blue-50 dark:hover:bg-slate-700"
                      >
                        Override to Met
                      </button>
                    </div>
                  )}

                  {/* OVERRIDE FORM */}
                  {isEditing && (
                    <div className="mt-5 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-800/50 p-4">
                      <div className="mb-3">
                        <label
                          htmlFor={`justification-${criterion.id}`}
                          className="block text-sm font-semibold text-gray-700 dark:text-slate-200"
                        >
                          Override Justification
                        </label>
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                          A justification is required before overriding this
                          criterion.
                        </p>
                      </div>
                      <textarea
                        id={`justification-${criterion.id}`}
                        value={justification}
                        onChange={(event) =>
                          setJustification(event.target.value)
                        }
                        placeholder="Enter the clinical justification for overriding this criterion..."
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-3 text-sm outline-none transition focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-400/20"
                      />

                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          disabled={!justification.trim()}
                          onClick={() => applyOverride(criterion)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Confirm Override
                        </button>

                        <button
                          type="button"
                          onClick={cancelOverride}
                          className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OVERRIDE JUSTIFICATION */}
                  {isOverridden && (
                    <div className="mt-4 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-800/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                        Reviewer Justification
                      </p>

                      <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                        {overrides[criterion.id]?.justification}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* REVIEW ACTIONS*/}
      <div className="mt-10 border-t border-gray-200 dark:border-slate-700 pt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Review Action
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitReview("APPROVED")}
            className="rounded-lg bg-green-600 px-5 py-2.5 text-white transition hover:bg-green-700 dark:hover:bg-green-500 shadow-sm"
          >
            {isSubmitting ? "Saving…" : "Approve"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitReview("DENIED")}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-white transition hover:bg-red-700 dark:hover:bg-red-500 shadow-sm"
          >
            Deny
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitReview("REQUEST_ADDITIONAL_INFO")}
            className="rounded-lg bg-amber-500 px-5 py-2.5 text-white transition hover:bg-amber-600 dark:hover:bg-amber-400 shadow-sm"
          >
            Request Additional Information
          </button>
        </div>
        {submitMessage && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            {submitMessage}
          </p>
        )}
      </div>

      {/* DRAWERS */}
      <ExecutionTraceDrawer
        open={showTrace}
        onClose={() => setShowTrace(false)}
        trace={trace}
      />
      <EvidenceDrawer
        open={showEvidence}
        onClose={() => setShowEvidence(false)}
        evidence={evidence}
      />
    </div>
  );
}
