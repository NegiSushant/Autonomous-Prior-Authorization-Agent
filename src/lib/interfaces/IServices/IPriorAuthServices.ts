import { PAAgentState, PriorAuthResponse } from "@/types/agentState.dto";
import { SessionUser } from "@/types/users.dto";

export interface IPriorAuthService {
  executePriorAuthorization(
    patientId: number,
    session: SessionUser,
  ): Promise<PAAgentState | null>;

  mapAgentResponse(state: PAAgentState): Promise<PriorAuthResponse | null>;

  storeAgentResponse(state: PriorAuthResponse): Promise<boolean>;
}
