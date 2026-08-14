import { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";

import { PriorAuthRequestSchema } from "./prior-auth";
import { ClinicalEvidenceSchema } from "./evidence";
import { FinalBriefing } from "./briefing";

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
