import { z } from "zod";

export const EvidenceSourceSchema = z.enum(["EHR", "Pharmacy", "Imaging"]);

export const EvidenceStatusSchema = z.enum(["Met", "Not Met", "Unclear"]);

export const ClinicalEvidenceSchema = z.object({
  sourceType: EvidenceSourceSchema,
  documentId: z.string(),
  dateFound: z.string(),
  status: EvidenceStatusSchema,
  snippetText: z.string(),
});

export type ClinicalEvidence = z.infer<typeof ClinicalEvidenceSchema>;
