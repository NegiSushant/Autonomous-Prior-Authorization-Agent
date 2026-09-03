export interface PolicyRetrievalResult {
  insurance: string;
  procedure: string;
  cpt_code?: string;
  rules: string[];
  sourceFiles: string[];
}

export interface ToolResult {
  success: boolean;
  patientId?: number;
  results: Array<{
    documentId: string;
    date: Date;
    text?: string;
    report?: string;
    medication?: string;
  }>;
  message?: string;
  error?: string;
}

export interface ToolErrorResult {
  success: false;
  patientId?: number;
  results: [];
  message: string;
  error: string;
  tool: string;
}

export interface ParsedToolResult {
  success: boolean;
  results: unknown[];
  message?: string;
}

export interface FailedToolCall {
  toolName: string;
  args: Record<string, unknown>;
  reason: "empty" | "failed";
}

export interface EvidenceItem {
  sourceType: string;
  documentId: string;
  dateFound: Date;
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
