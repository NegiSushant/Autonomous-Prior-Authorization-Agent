import { PriorAuthResponse } from "./agentState.dto";


export interface CriteriaOverride {
  criteriaId: string;
  originalSatisfied: boolean;
  overriddenSatisfied: boolean;
  justification: string;
}

export type FinalReviewDecision =
  | "APPROVED"
  | "DENIED"
  | "REQUEST_ADDITIONAL_INFO";

export interface PriorAuthReviewPayload {
  /** The original agent response */
  agentResult: PriorAuthResponse; 
  /** Any criteria the reviewer overrode */
  overrides: CriteriaOverride[];
  /** Final human decision */
  decision: FinalReviewDecision;
  /** Optional free-text note from the reviewer */
  reviewerNote?: string;
}

export interface PriorAuthReviewSummary {
  id: string;
  patientId: string;
  agentRecommendation: string;
  agentStatus: string;
  finalDecision: string;
  reviewerNote: string | null;
  overridesJson: CriteriaOverride[];
  createdAt: string;
}
