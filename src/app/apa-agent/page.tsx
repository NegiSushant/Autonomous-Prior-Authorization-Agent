"use client";

import { useState } from "react";
import PatientSelector from "@/components/dashboard/PatientSelector";
import InvestigationRunner from "@/components/dashboard/InvestigationRunner";
import RecommendationPanel from "@/components/dashboard/RecommendationPanel";
import { PriorAuthResponse } from "@/types/prior-auth-response";
import ReviewHistory from "@/components/dashboard/ReviewHistory";

export default function Home() {
  const [patientId, setPatientId] = useState("PAT001");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriorAuthResponse | null>(null);
  const [runId, setRunId] = useState(0);

  function handlePatientChange(newId: string) {
    setPatientId(newId);
    setResult(null);
  }

  async function runInvestigation() {
    setLoading(true);
    setResult(null);
    setRunId((id) => id + 1);
    try {
      const response = await fetch("/api/prior-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
        }),
      });
      const data = await response.json();
      console.log(data);
      setResult(data.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl p-8 grow w-full transition-colors duration-200">
      <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">
        Prior Authorization Dashboard
      </h1>
      <PatientSelector patientId={patientId} onChange={handlePatientChange} />
      <InvestigationRunner loading={loading} onRun={runInvestigation} />
      {result && (
        <RecommendationPanel
          key={`${result.patientId}-${runId}`}
          result={result}
          recommendation={result.recommendation}
          status={result.status}
          trace={result.executionTrace}
          evidence={result.gatheredEvidence}
          criteria={result.criteria}
        />
      )}
      {/**See the Human override history */}
      <div className="mt-10">
        <ReviewHistory patientId={patientId} />
      </div>
    </main>
  );
}
