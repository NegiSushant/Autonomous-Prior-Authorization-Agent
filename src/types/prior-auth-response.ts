export interface EvidenceItem {
  sourceType: string;
  documentId: string;
  dateFound: string;
  status: string;
  snippetText: string;
}

export interface CriterionEvaluation {
  id: string;
  criterion: string;
  satisfied: boolean;
  explanation: string;
}

export interface ExecutionStep {
  type: "reasoner" | "tool" | "reflection";
  title: string;
  content: string;
  toolName?: string;
  toolArguments?: Record<string, unknown>;
  toolResult?: unknown;
}

export interface PriorAuthResponse {
  patientId: string;
  status: string;
  recommendation: string;
  criteria: CriterionEvaluation[];
  gatheredEvidence: EvidenceItem[];
  executionTrace: ExecutionStep[];
}

// ─── New types for Phase 8 audit ───────────────────────────────────────────

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
