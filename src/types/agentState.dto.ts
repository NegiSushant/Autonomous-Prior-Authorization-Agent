import { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";

const RecommendationStatusSchema = z.enum([
  "Auto-Approved",
  "Manual Review Required",
]);

const CriteriaStatusSchema = z.enum(["Met", "Not Met", "Unclear"]);

const CriteriaEvidenceSchema = z.object({
  date: z.date(),
  snippet: z.string(),
  sourceType: z.enum(["EHR", "Pharmacy", "Imaging"]),
  documentId: z.string().optional(),
});

const CriteriaBreakdownSchema = z.object({
  criterion: z.string(),
  status: CriteriaStatusSchema,
  explanation: z.string(),
  evidence: z.array(CriteriaEvidenceSchema),
  overridden: z.boolean().default(false),
  overrideJustification: z.string().optional(),
});

export const FinalBriefingSchema = z.object({
  recommendationStatus: RecommendationStatusSchema,
  rationale: z.string(),
  criteriaBreakdown: z.array(CriteriaBreakdownSchema),
  finalDetermination: z.string(),
  reasoningTrace: z.array(z.string()),
});

export type FinalBriefing = z.infer<typeof FinalBriefingSchema>;

const EvidenceSourceSchema = z.enum(["EHR", "Pharmacy", "Imaging"]);
const EvidenceStatusSchema = z.enum(["Met", "Not Met", "Unclear"]);

export const ClinicalEvidenceSchema = z.object({
  sourceType: EvidenceSourceSchema,
  documentId: z.string(),
  dateFound: z.date(),
  status: EvidenceStatusSchema,
  snippetText: z.string(),
});

export type ClinicalEvidence = z.infer<typeof ClinicalEvidenceSchema>;

export const PriorAuthRequestSchema = z.object({
  patientId: z.number(),
  procedureCode: z.string(),
  procedureName: z.string(),
  diagnosisCode: z.string(),
  insurancePayer: z.string(),
});

export type PriorAuthRequest = z.infer<typeof PriorAuthRequestSchema>;

export const AgentStatusSchema = z.enum([
  "in_progress",
  "completed",
  "max_iterations_reached",
]);

export interface PAAgentState {
  patientDetails: z.infer<typeof PriorAuthRequestSchema>;
  policyRules: string[];
  gatheredEvidence: z.infer<typeof ClinicalEvidenceSchema>[];
  conflicts: string[];
  iterationCount: number;
  status: z.infer<typeof AgentStatusSchema>;
  messages: BaseMessage[];
  finalReport?: FinalBriefing;
}
