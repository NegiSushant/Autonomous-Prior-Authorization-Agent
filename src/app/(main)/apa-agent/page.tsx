"use client";

import { useState } from "react";
import PatientTable from "@/components/dashboard/PatientTable";
import RecommendationPanel from "@/components/dashboard/RecommendationPanel";
import ReviewHistory from "@/components/dashboard/ReviewHistory";
import { PriorAuthResponse } from "@/types/agentState.dto";
// import { PriorAuthResponse } from "@/types/prior-auth-response";

export default function Home() {
  const [patientId, setPatientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriorAuthResponse | null>(null);
  const [runId, setRunId] = useState(0);

  function handlePatientChange(newId: number) {
    setPatientId(newId);
    setResult(null);
  }

  async function runInvestigation(targetPatientId: number) {
    setPatientId(targetPatientId);
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
          patientId: targetPatientId,
        }),
      });
      const data = await response.json();
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

      {/* Replaced dropdown with Tabular view */}
      <PatientTable
        selectedPatientId={patientId}
        onSelect={handlePatientChange}
        onRun={runInvestigation}
        isInvestigating={loading}
      />

      {result && (
        <div className="mt-8">
          <RecommendationPanel
            key={`${result.patientId}-${runId}`}
            result={result}
            recommendation={result.recommendation}
            status={result.status}
            trace={result.executionTrace}
            evidence={result.gatheredEvidence}
            criteria={result.criteria}
          />
        </div>
      )}

      {/* Only show review history if a patient is selected */}
      {patientId && (
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
            Human Review History
          </h2>
          <ReviewHistory patientId={patientId} />
        </div>
      )}
    </main>
  );
}

// "use client";

// import { useState } from "react";
// import PatientSelector from "@/components/dashboard/PatientSelector";
// import InvestigationRunner from "@/components/dashboard/InvestigationRunner";
// import RecommendationPanel from "@/components/dashboard/RecommendationPanel";
// import { PriorAuthResponse } from "@/types/prior-auth-response";
// import ReviewHistory from "@/components/dashboard/ReviewHistory";

// export default function Home() {
//   const [patientId, setPatientId] = useState("PAT001");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<PriorAuthResponse | null>(null);
//   const [runId, setRunId] = useState(0);

//   function handlePatientChange(newId: string) {
//     setPatientId(newId);
//     setResult(null);
//   }

//   async function runInvestigation() {
//     setLoading(true);
//     setResult(null);
//     setRunId((id) => id + 1);
//     try {
//       const response = await fetch("/api/prior-auth", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           patientId,
//         }),
//       });
//       const data = await response.json();
//       console.log(data);
//       setResult(data.data);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="mx-auto max-w-7xl p-8 grow w-full transition-colors duration-200">
//       <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">
//         Prior Authorization Dashboard
//       </h1>
//       <PatientSelector patientId={patientId} onChange={handlePatientChange} />
//       <InvestigationRunner loading={loading} onRun={runInvestigation} />
//       {result && (
//         <RecommendationPanel
//           key={`${result.patientId}-${runId}`}
//           result={result}
//           recommendation={result.recommendation}
//           status={result.status}
//           trace={result.executionTrace}
//           evidence={result.gatheredEvidence}
//           criteria={result.criteria}
//         />
//       )}
//       {/**See the Human override history */}
//       <div className="mt-10">
//         <ReviewHistory patientId={patientId} />
//       </div>
//     </main>
//   );
// }
