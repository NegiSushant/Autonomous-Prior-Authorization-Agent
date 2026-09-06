import { JsonValue } from "@prisma/client/runtime/client";
import { CriterionEvaluation, EvidenceItem, ExecutionStep } from "./tools.dto";

export type UserRole = "SUPERADMIN" | "ADMIN" | "REVIEWER";

export interface IUser {
  id: number;
  email: string;
  password: string;
  name: string | null;
  role: UserRole;
  organizationId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPriorAuthReview {
  id: number;
  patientId: number;
  agentRecommendation: string;
  agentStatus: string;
  finalDecision: string | null;
  reviewerNote: string | null;
  reviewerId: number | null;
  criteria: CriterionEvaluation[];
  executionTrace: ExecutionStep[];
  gatheredEvidence: EvidenceItem[];
  agentResultJson: JsonValue;
  overridesJson: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}
