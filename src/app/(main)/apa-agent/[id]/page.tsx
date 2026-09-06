"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RecommendationPanel from "@/components/dashboard/RecommendationPanel";
// import ReviewHistory from "@/components/dashboard/ReviewHistory";
import { IPriorAuthReview } from "@/types/users.entity";
import { Loader2, Info } from "lucide-react";
import { PatientFullResponseDto } from "@/types/patient.dto";
import PatientInfoPanel from "@/components/dashboard/PatientInfoPanel";

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
            <RecommendationPanel
              result={result}
              patientId={result.patientId}
              recommendation={result.agentRecommendation}
              status={result.agentStatus}
              trace={result.executionTrace}
              evidence={result.gatheredEvidence}
              criteria={result.criteria}
            />
          ) : (
            <div className="flex h-40 flex-col gap-2 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500">
              <Info className="h-6 w-6 text-gray-400" />
              No recommendation data available for this patient.
            </div>
          )}

          {/* <div className="mt-10">
            <h2>Human Review History</h2>
            <ReviewHistory patientId={patientId} />
          </div> */}
        </div>
      </div>
    </main>
  );
}

// "use client";

// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import RecommendationPanel from "@/components/dashboard/RecommendationPanel";
// import ReviewHistory from "@/components/dashboard/ReviewHistory";
// import { IPriorAuthReview } from "@/types/users.entity";
// import { Loader2, User } from "lucide-react";
// import { PatientFullResponseDto } from "@/types/patient.dto";
// import { InfoRow } from "@/components/dashboard/patientInfoRows";

// export default function PatientDetailPage() {
//   const { id } = useParams<{ id: string }>();
//   const patientId = Number(id);

//   const [result, setResult] = useState<IPriorAuthReview | null>(null);
//   const [patientInfo, setPatientInfo] = useState<PatientFullResponseDto>();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await fetch(`/api/prior-auth/${patientId}`);
//         const patientres = await fetch("/api/admin/patients");
//         const json = await patientres.json();

//         if (!patientres.ok || !json.success) {
//           throw new Error(json.message || "Failed to load");
//         }
//         setPatientInfo(json.data ?? []);

//         if (!res.ok) throw new Error("No prior-auth result found");
//         const data = await res.json();
//         setResult(data.data);
//       } catch (e) {
//         setError(e instanceof Error ? e.message : "Failed to load");
//       } finally {
//         setLoading(false);
//       }
//     }
//     if (patientId) {
//       console.log(`PatientId: ${patientId}`);
//       load();
//     }
//   }, [patientId]);

//   if (loading) {
//     return (
//       <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
//         <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
//         Error loading patients: {error}
//       </div>
//     );
//   }

//   return (
//     <main className="space-y-6 p-4 md:p-6">
//       {/* Page Title */}
//       <div>
//         <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
//           Patient Agent Response:{" "}
//           <span className="text-blue-600 dark:text-blue-400">
//             {`Test User`}
//           </span>
//         </h1>
//         <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
//           Review clinical details and agent recommendation side by side
//         </p>
//       </div>

//       {/* Two-column layout */}
//       <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
//         {/* ========== LEFT: Patient Full Information ========== */}
//         <div className="xl:col-span-4">
//           <div className="sticky top-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
//             <div className="mb-5 flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
//                 <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                   Patient Information
//                 </h2>
//                 <p className="text-xs text-gray-500 dark:text-slate-400">
//                   Full clinical profile
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-4 text-sm">
//               <InfoRow label="Patient ID" value={patientInfo?.id} />
//               <InfoRow label="Full Name" value={patientInfo?.name} />
//               {/* {patientInfo.dob && (
//                 <InfoRow
//                   label="Date of Birth"
//                   value={patientInfo.dob}
//                   icon={<Calendar className="h-3.5 w-3.5" />}
//                 />
//               )} */}
//               {/* <InfoRow label="Email" value={patientInfo?.email} /> */}
//               <InfoRow
//                 label="Insurance Payer"
//                 value={patientInfo?.insurancePayer}
//               />
//               {/* {patientInfo.gender && (
//                 <InfoRow label="Gender" value={patientInfo.gender} />
//               )}
//               {patientInfo.memberId && (
//                 <InfoRow label="Member ID" value={patientInfo.memberId} />
//               )}
//               {patientInfo.organization && (
//                 <InfoRow
//                   label="Organization"
//                   value={patientInfo.organization}
//                   icon={<Building2 className="h-3.5 w-3.5" />}
//                 />
//               )} */}

//               {/* You can expand this section with more fields from result */}
//               {/* Example: diagnosis, requested service, etc. */}
//             </div>
//           </div>
//         </div>

//         {/* ========== RIGHT: Agent Response (existing RecommendationPanel) ========== */}
//         <div className="xl:col-span-8">
//           {result && (
//             <RecommendationPanel
//               result={result}
//               patientId={result.patientId}
//               recommendation={result.agentRecommendation}
//               status={result.agentStatus}
//               trace={result.executionTrace}
//               evidence={result.gatheredEvidence}
//               criteria={result.criteria}
//             />
//           )}
//         </div>
//       </div>

//       {/* <div className="mt-10">
//         <h2>Human Review History</h2>
//         <ReviewHistory patientId={patientId} />
//       </div> */}
//     </main>
//   );
// }
