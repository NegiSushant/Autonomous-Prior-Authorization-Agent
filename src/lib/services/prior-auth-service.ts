import patients from "@/mocks/patients.json";
import policyText from "@/mocks/policy";
import { paGraph as graph } from "@/lib/graph/graph";
import { PAAgentState } from "@/lib/schemas/state";

export async function executePriorAuthorization(
  patientId: string,
): Promise<PAAgentState> {
  const patient = patients.find((p) => p.patientId === patientId);

  if (!patient) {
    throw new Error(`Patient '${patientId}' not found.`);
  }

  const initialState: PAAgentState = {
    patientDetails: {
      patientId: patient.patientId,
      procedureCode: patient.procedureCode,
      procedureName: patient.procedureName,
      diagnosisCode: patient.diagnosisCode,
      insurancePayer: patient.insurancePayer,
    },

    policyRules: [policyText],
    gatheredEvidence: [],
    conflicts: [],
    iterationCount: 0,
    status: "in_progress",
    messages: [],
  };

  const result = await graph.invoke(initialState);

  return result;
}
