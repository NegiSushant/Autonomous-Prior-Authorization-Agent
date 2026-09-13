import { PriorAuthResponse } from "@/types/agentState.dto";
import {
  CriteriaOverride,
  FinalReviewDecision,
} from "@/types/priorAuthResponse.dto";
import { IPriorAuthReview } from "@/types/users.entity";

export interface IAgentsDataRepository {
  fetchSimilarPolicyChunks(
    embedding: number[],
    limit: number,
  ): Promise<
    Array<{
      content: string;
      insurance: string | null;
      procedure: string | null;
      source_file: string | null;
      distance: number;
    }>
  >;

  storeAgentResponse(state: PriorAuthResponse): Promise<boolean>;
  overrideAgentResponse(
    patientId: number,
    overrides: CriteriaOverride[],
    decision: FinalReviewDecision,
    reviewerId: number,
    reviewerNote?: string,
  ): Promise<boolean>;

  getAgentResponseBasedOnId(
    patientId: number,
  ): Promise<IPriorAuthReview | null>;
}
