import { PAAgentState, PriorAuthResponse } from "@/types/agentState.dto";
import { PriorAuthReviewPayload } from "@/types/priorAuthResponse.dto";
import { SessionUser } from "@/types/users.dto";
import { IPriorAuthReview } from "@/types/users.entity";

export interface IPriorAuthService {
  executePriorAuthorization(
    patientId: number,
    session: SessionUser,
  ): Promise<PAAgentState | null>;

  mapAgentResponse(state: PAAgentState): Promise<PriorAuthResponse | null>;

  storeAgentResponse(state: PriorAuthResponse): Promise<boolean>;

  storeOverrideResponse(
    state: PriorAuthReviewPayload,
    reviewerId: number,
  ): Promise<boolean>;

  retriveAgentResponse(patientId: number): Promise<IPriorAuthReview | null>;
}
