"use client";

import { useState } from "react";
import PatientSelector from "@/components/dashboard/PatientSelector";
import InvestigationRunner from "@/components/dashboard/InvestigationRunner";
import RecommendationPanel from "@/components/dashboard/RecommendationPanel";
import { PriorAuthResponse } from "@/types/prior-auth-response";

export default function Home() {
  const [patientId, setPatientId] = useState("PAT001");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriorAuthResponse | null>(null);

  async function runInvestigation() {
    setLoading(true);
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
      setResult(data.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl p-8 grow w-full">
      <h1 className="mb-8 text-3xl font-bold">Prior Authorization Dashboard</h1>
      <PatientSelector patientId={patientId} onChange={setPatientId} />
      <InvestigationRunner loading={loading} onRun={runInvestigation} />
      {result && (
        <RecommendationPanel
          recommendation={result.recommendation}
          status={result.status}
          trace={result.executionTrace}
          evidence={result.gatheredEvidence}
          criteria={result.criteria}
        />
      )}
    </main>
  );
}
