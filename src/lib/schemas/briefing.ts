import { z } from "zod";

export const RecommendationStatusSchema = z.enum([
  "Auto-Approved",
  "Manual Review Required",
]);

export const CriteriaBreakdownSchema = z.object({
  criterion: z.string(),
  satisfied: z.boolean(),
  explanation: z.string(),
});

export const FinalBriefingSchema = z.object({
  recommendationStatus: RecommendationStatusSchema,
  criteriaBreakdown: z.array(CriteriaBreakdownSchema),
  reasoningTrace: z.array(z.string()),
});

export type FinalBriefing = z.infer<typeof FinalBriefingSchema>;
