import { useState } from "react";
import { Brain, FileSearch } from "lucide-react";
import ExecutionTraceDrawer from "./ExecutionTraceDrawer";
import EvidenceDrawer from "./EvidenceDrawer";
import { EvidenceItem, ExecutionStep } from "@/types/prior-auth-response";

interface RecommendationPanelProps {
  recommendation: string;
  status: string;
  trace: ExecutionStep[];
  evidence: EvidenceItem[];
}

export default function RecommendationPanel({
  recommendation,
  status,
  trace,
  evidence,
}: RecommendationPanelProps) {
  const [showTrace, setShowTrace] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const isApproved = recommendation.toLowerCase().includes("approved");

  const isManualReview = recommendation.toLowerCase().includes("manual review");

  const recommendationColor = isApproved
    ? "bg-green-100 text-green-800 border-green-200"
    : isManualReview
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-red-100 text-red-800 border-red-200";

  const statusColor =
    status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Final Recommendation
        </h2>

        <div className="flex gap-3">
          <button
            onClick={() => setShowTrace(true)}
            className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100"
            title="Agent Execution Trace"
          >
            <Brain className="h-5 w-5 text-blue-600" />
          </button>

          <button
            onClick={() => setShowEvidence(true)}
            className="rounded-lg border border-gray-200 p-2 transition hover:bg-gray-100"
            title="Collected Evidence"
          >
            <FileSearch className="h-5 w-5 text-green-600" />
          </button>
        </div>
      </div>

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

      <div className="mt-8 flex flex-wrap gap-3">
        <button className="rounded-lg bg-green-600 px-5 py-2.5 text-white transition hover:bg-green-700">
          Approve
        </button>

        <button className="rounded-lg bg-red-600 px-5 py-2.5 text-white transition hover:bg-red-700">
          Deny
        </button>

        <button className="rounded-lg bg-amber-500 px-5 py-2.5 text-white transition hover:bg-amber-600">
          Request Additional Information
        </button>
      </div>
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
