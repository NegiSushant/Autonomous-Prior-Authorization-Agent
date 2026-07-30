export interface EvidenceItem {
  sourceType: string;
  dateFound: string;
  status: string;
  snippetText: string;
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
  gatheredEvidence: EvidenceItem[];
  executionTrace: ExecutionStep[];
}
