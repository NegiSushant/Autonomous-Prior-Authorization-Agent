import { PAAgentState, PriorAuthResponse } from "@/types/agentState.dto";
import { PolicyRetrievalResult } from "@/types/tools.dto";
import { SessionUser } from "@/types/users.dto";

export interface IPriorAuthService {
  executePriorAuthorization(
    patientId: number,
    session: SessionUser,
  ): Promise<PAAgentState | null>;

  retrievePolicyRules(
    procedure: string,
    insurance: string,
    cpt_code?: string,
    maxBullets?: number,
  ): Promise<PolicyRetrievalResult | null>;

  mapAgentResponse(state: PAAgentState): Promise<PriorAuthResponse | null>;
}
