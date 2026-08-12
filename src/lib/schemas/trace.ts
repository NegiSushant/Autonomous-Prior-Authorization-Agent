import { z } from "zod";

export const TraceStepTypeSchema = z.enum([
  "think",
  "act",
  "observe",
  "reflect",
]);

export const AgentTraceStepSchema = z.object({
  id: z.string(),
  type: TraceStepTypeSchema,
  title: z.string(),
  content: z.string(),
  toolName: z.string().optional(),
  toolArgs: z.record(z.string(), z.unknown()).optional(),
});

export type AgentTraceStep = z.infer<typeof AgentTraceStepSchema>;
