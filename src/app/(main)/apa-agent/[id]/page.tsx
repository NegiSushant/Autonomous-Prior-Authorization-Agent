"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RecommendationPanel from "@/components/dashboard/RecommendationPanel";
import ReviewHistory from "@/components/dashboard/ReviewHistory";
import { IPriorAuthReview } from "@/types/users.entity";
import { Loader2, Info } from "lucide-react";
import { PatientFullResponseDto } from "@/types/patient.dto";
import PatientInfoPanel from "@/components/dashboard/PatientInfoPanel";
import DemoBanner from "@/components/DemoBanner";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);

  const [result, setResult] = useState<IPriorAuthReview | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientFullResponseDto>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch Prior Auth Result
        const res = await fetch(`/api/prior-auth/${patientId}`);
        if (!res.ok) throw new Error("No prior-auth result found");
        const data = await res.json();
        setResult(data.data);

        // Fetch Patient Data
        const patientres = await fetch(`/api/admin/patients`);
        const json = await patientres.json();

        if (!patientres.ok || !json.success) {
          throw new Error(json.message || "Failed to load patient data");
        }

        // Find the specific patient if the endpoint returns an array
        const patientData = Array.isArray(json.data)
          ? json.data.find((p: PatientFullResponseDto) => p.id === patientId)
          : json.data;

        if (patientData) {
          setPatientInfo(patientData);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      load();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
        Error loading patient details: {error}
      </div>
    );
  }

  return (
    <main className="space-y-6 p-4 md:p-6">
      {/* Page Title */}
      <DemoBanner />
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Patient Agent Response:{" "}
          <span className="text-blue-600 dark:text-blue-400">
            {patientInfo?.name || "Unknown Patient"}
          </span>
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Review clinical details and agent recommendation side by side
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
        {/* ========== LEFT: Patient Full Information ========== */}
        <div className="xl:col-span-4 sticky top-6 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700">
          <PatientInfoPanel patientInfo={patientInfo} />
        </div>

        {/* ========== RIGHT: Agent Response (RecommendationPanel) ========== */}
        <div className="xl:col-span-8">
          {result ? (
            <>
              <RecommendationPanel
                result={result}
                patientId={result.patientId}
                recommendation={result.agentRecommendation}
                status={result.agentStatus}
                trace={result.executionTrace}
                evidence={result.gatheredEvidence}
                criteria={result.criteria}
              />

              <div className="mt-10">
                <h2>Human Review History</h2>
                <ReviewHistory
                  patientId={result.patientId}
                  reviewerNote={result.reviewerNote}
                  reviewerId={result.reviewerId}
                  overridesJson={result.overridesJson}
                />
              </div>
            </>
          ) : (
            <div className="flex h-40 flex-col gap-2 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500">
              <Info className="h-6 w-6 text-gray-400" />
              No recommendation data available for this patient.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}