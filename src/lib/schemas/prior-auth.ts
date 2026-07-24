import * as z from "zod";

export const PriorAuthRequestSchema = z.object({
  patientId: z.string().min(1),
  procedureCode: z.string(),
  procedureName: z.string(),
  diagnosisCode: z.string(),
  insurancePayer: z.string(),
});

export type PriorAuthRequest = z.infer<typeof PriorAuthRequestSchema>;
