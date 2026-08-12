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

import {
  EvidenceItem,
  ExecutionStep,
  CriterionEvaluation,
} from "@/types/prior-auth-response";

interface RecommendationPanelProps {
  recommendation: string;
  status: string;
  trace: ExecutionStep[];
  evidence: EvidenceItem[];
  criteria: CriterionEvaluation[];
}

interface OverrideState {
  satisfied: boolean;
  justification: string;
  overridden: boolean;
}

export default function RecommendationPanel({
  recommendation,
  status,
  trace,
  evidence,
  criteria,
}: RecommendationPanelProps) {
  const [showTrace, setShowTrace] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  /*
   * Stores human overrides locally in the UI.
   *
   * Example:
   *
   * {
   *   "conservative-therapy": {
   *      satisfied: true,
   *      justification: "Reviewed additional EHR documentation.",
   *      overridden: true
   *   }
   * }
   */
  const [overrides, setOverrides] = useState<Record<string, OverrideState>>({});
  const [activeOverride, setActiveOverride] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  // Recommendation
  const isApproved = recommendation.toLowerCase().includes("approved");
  const isManualReview = recommendation.toLowerCase().includes("manual review");
  const recommendationColor = isApproved
    ? "bg-green-100 text-green-800 border-green-200"
    : isManualReview
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-red-100 text-red-800 border-red-200";

  // Status
  const statusColor =
    status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

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
        satisfied: true,
        justification: justification.trim(),
        overridden: true,
      },
    }));
    setActiveOverride(null);
    setJustification("");
  }

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/*HEADER*/}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Final Recommendation
        </h2>
        <div className="flex gap-3">
          {/* Execution Trace */}
          <button
            onClick={() => setShowTrace(true)}
            className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100"
            title="Agent Execution Trace"
          >
            <Brain className="h-5 w-5 text-blue-600" />
          </button>
          {/* Evidence */}
          <button
            onClick={() => setShowEvidence(true)}
            className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100"
            title="Collected Evidence"
          >
            <FileSearch className="h-5 w-5 text-green-600" />
          </button>
        </div>
      </div>

      {/* RECOMMENDATION + STATUS */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">
            Recommendation
          </p>
          <span
            className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${recommendationColor}`}
          >
            {recommendation}
          </span>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-500">
            Investigation Status
          </p>
          <span
            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${statusColor}`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* POLICY CRITERIA */}
      <div className="mt-10">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Policy Criteria
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Review the evidence supporting each authorization criterion.
          </p>
        </div>

        <div className="space-y-4">
          {criteria.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500">
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
                  className={`rounded-xl border p-5 ${
                    isOverridden
                      ? "border-blue-300 bg-blue-50"
                      : isSatisfied
                        ? "border-green-200 bg-green-50"
                        : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  {/* Criterion header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      {isSatisfied ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                      )}

                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {criterion.criterion}
                        </h4>

                        <p className="mt-1 text-sm text-gray-600">
                          {criterion.explanation}
                        </p>
                      </div>
                    </div>
                    {/* Status badge */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isSatisfied
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {isSatisfied ? "Met" : "Not Met"}
                      </span>

                      {isOverridden && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          <UserRoundCheck className="h-3.5 w-3.5" />
                          Human Override
                        </span>
                      )}
                    </div>
                  </div>

                  {/* OVERRIDE BUTTON*/}
                  {!isSatisfied && !isEditing && (
                    <div className="mt-4 border-t border-yellow-200 pt-4">
                      <button
                        type="button"
                        onClick={() => startOverride(criterion.id)}
                        className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                      >
                        Override to Met
                      </button>
                    </div>
                  )}

                  {/* OVERRIDE FORM */}
                  {isEditing && (
                    <div className="mt-5 rounded-lg border border-blue-200 bg-white p-4">
                      <div className="mb-3">
                        <label
                          htmlFor={`justification-${criterion.id}`}
                          className="block text-sm font-semibold text-gray-700"
                        >
                          Override Justification
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
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
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          disabled={!justification.trim()}
                          onClick={() => applyOverride(criterion)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Confirm Override
                        </button>

                        <button
                          type="button"
                          onClick={cancelOverride}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OVERRIDE JUSTIFICATION */}
                  {isOverridden && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Reviewer Justification
                      </p>

                      <p className="mt-2 text-sm text-gray-700">
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
      <div className="mt-10 border-t border-gray-200 pt-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Review Action
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-green-600 px-5 py-2.5 text-white transition hover:bg-green-700"
          >
            Approve
          </button>

          <button
            type="button"
            className="rounded-lg bg-red-600 px-5 py-2.5 text-white transition hover:bg-red-700"
          >
            Deny
          </button>

          <button
            type="button"
            className="rounded-lg bg-amber-500 px-5 py-2.5 text-white transition hover:bg-amber-600"
          >
            Request Additional Information
          </button>
        </div>
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
