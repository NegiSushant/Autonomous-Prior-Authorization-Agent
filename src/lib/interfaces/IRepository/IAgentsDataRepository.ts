import { PriorAuthResponse } from "@/types/agentState.dto";

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

  storeAgentResponse(state: PriorAuthResponse): Promise<boolean>
}
