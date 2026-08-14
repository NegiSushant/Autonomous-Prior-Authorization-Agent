import { z } from "zod";

export const RecommendationStatusSchema = z.enum([
  "Auto-Approved",
  "Manual Review Required",
]);

export const CriteriaStatusSchema = z.enum(["Met", "Not Met", "Unclear"]);

export const CriteriaEvidenceSchema = z.object({
  date: z.string(),
  snippet: z.string(),
  sourceType: z.enum(["EHR", "Pharmacy", "Imaging"]),
  documentId: z.string().optional(),
});

export const CriteriaBreakdownSchema = z.object({
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

// import { z } from "zod";

// export const RecommendationStatusSchema = z.enum([
//   "Auto-Approved",
//   "Manual Review Required",
// ]);

// export const CriteriaBreakdownSchema = z.object({
//   criterion: z.string(),
//   satisfied: z.boolean(),
//   explanation: z.string(),
// });

// export const FinalBriefingSchema = z.object({
//   recommendationStatus: RecommendationStatusSchema,
//   criteriaBreakdown: z.array(CriteriaBreakdownSchema),
//   reasoningTrace: z.array(z.string()),
// });

// export type FinalBriefing = z.infer<typeof FinalBriefingSchema>;
