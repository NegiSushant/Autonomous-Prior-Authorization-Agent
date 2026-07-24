// import { z } from "zod";
// import { BaseMessage } from "@langchain/core/messages";
// import { PriorAuthRequestSchema } from "./prior-auth";
// import { ClinicalEvidenceSchema } from "./evidence";

// export const AgentStatusSchema = z.enum([
//   "in_progress",
//   "completed",
//   "max_iterations_reached",
// ]);

// export interface PAAgentState {
//   patientDetails: z.infer<typeof PriorAuthRequestSchema>;
//   policyRules: string[];
//   gatheredEvidence: z.infer<typeof ClinicalEvidenceSchema>[];
//   iterationCount: number;
//   status: z.infer<typeof AgentStatusSchema>;
//   messages: BaseMessage[];
// }
import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";

import { PriorAuthRequestSchema } from "./prior-auth";
import { ClinicalEvidenceSchema } from "./evidence";

export const AgentStatusSchema = z.enum([
  "in_progress",
  "completed",
  "max_iterations_reached",
]);

export interface PAAgentState {
  patientDetails: z.infer<typeof PriorAuthRequestSchema>;
  policyRules: string[];
  gatheredEvidence: z.infer<typeof ClinicalEvidenceSchema>[];
  iterationCount: number;
  status: z.infer<typeof AgentStatusSchema>;
  messages: BaseMessage[];
}

export const PAAgentStateAnnotation = Annotation.Root({
  patientDetails: Annotation<PAAgentState["patientDetails"]>(),

  policyRules: Annotation<string[]>({
    reducer: (_, update) => update,
    default: () => [],
  }),

  gatheredEvidence: Annotation<PAAgentState["gatheredEvidence"]>({
    reducer: (state, update) => [...state, ...update],
    default: () => [],
  }),

  iterationCount: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0,
  }),

  status: Annotation<PAAgentState["status"]>({
    reducer: (_, update) => update,
    default: () => "in_progress",
  }),

  messages: Annotation<BaseMessage[]>({
    reducer: (state, update) => [...state, ...update],
    default: () => [],
  }),
});
