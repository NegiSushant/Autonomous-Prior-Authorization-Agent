import { PAAgentState } from "../schemas/state";
import { PriorAuthRequest } from "../schemas/prior-auth";

export function createInitialState(request: PriorAuthRequest): PAAgentState {
  return {
    patientDetails: request,
    policyRules: [],
    gatheredEvidence: [],
    conflicts: [],
    iterationCount: 0,
    status: "in_progress",
    messages: [],
  };
}
