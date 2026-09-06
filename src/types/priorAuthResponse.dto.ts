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
  patientId: number;
  overrides: CriteriaOverride[];
  decision: FinalReviewDecision;
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
