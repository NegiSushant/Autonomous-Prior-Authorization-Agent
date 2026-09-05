import { PolicyRetrievalResult } from "@/types/tools.dto";

export interface IEmbeddingServices {
    embedQuery(text: string): Promise<number[]>;

    retrievePolicyRules(
      procedure: string,
      insurance: string,
      cpt_code?: string,
      maxBullets?: number,
    ): Promise<PolicyRetrievalResult | null>;
}
