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
