import { paGraph as graph } from "@/lib/graph/graph";
import { PAAgentState } from "@/lib/schemas/state";
import { retrievePolicyRules } from "@/lib/policy/retrieve-policy-rules";
import { patientDataService } from "../lib/data/postgres-data-service";

export async function executePriorAuthorization(
  patientId: string,
): Promise<PAAgentState> {
  // const patient = patients.find((p) => p.patientId === patientId);
  const patient = await patientDataService.getPatient(patientId);

  if (!patient) {
    throw new Error(`Patient '${patientId}' not found.`);
  }

  // Pre-Agent Fetcher (RAG): Backend retrieves policy; the agent never searches the policy manual.
  const policy = await retrievePolicyRules({
    procedure: patient.procedureName,
    insurance: patient.insurancePayer,
    cpt_code: patient.procedureCode,
    maxBullets: 4,
  });

  console.log("[Phase 9] Policy sources:", policy.sourceFiles);
  console.log("[Phase 9] Injected rules:", policy.rules);

  const initialState: PAAgentState = {
    patientDetails: {
      patientId: patient.patientId,
      procedureCode: patient.procedureCode,
      procedureName: patient.procedureName,
      diagnosisCode: patient.diagnosisCode,
      insurancePayer: patient.insurancePayer,
    },

    // Only the 3–4 retrieved bullets (not the full hardcoded policy)
    policyRules:
      policy.rules.length > 0
        ? policy.rules
        : [
            // Safe fallback if retrieval returns nothing
            "• No matching policy criteria were retrieved. Flag for manual review.",
          ],

    gatheredEvidence: [],
    conflicts: [],
    iterationCount: 0,
    status: "in_progress",
    messages: [],
  };

  const result = await graph.invoke(initialState);
  return result;
}

// import patients from "@/mocks/patients.json";
// import policyText from "@/mocks/policy";
// import { paGraph as graph } from "@/lib/graph/graph";
// import { PAAgentState } from "@/lib/schemas/state";

// export async function executePriorAuthorization(
//   patientId: string,
// ): Promise<PAAgentState> {
//   const patient = patients.find((p) => p.patientId === patientId);

//   if (!patient) {
//     throw new Error(`Patient '${patientId}' not found.`);
//   }

//   const initialState: PAAgentState = {
//     patientDetails: {
//       patientId: patient.patientId,
//       procedureCode: patient.procedureCode,
//       procedureName: patient.procedureName,
//       diagnosisCode: patient.diagnosisCode,
//       insurancePayer: patient.insurancePayer,
//     },

//     policyRules: [policyText],
//     gatheredEvidence: [],
//     conflicts: [],
//     iterationCount: 0,
//     status: "in_progress",
//     messages: [],
//   };

//   const result = await graph.invoke(initialState);

//   return result;
// }
