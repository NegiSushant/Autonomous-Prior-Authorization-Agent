export interface IAgentRAGRepository {
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
}
