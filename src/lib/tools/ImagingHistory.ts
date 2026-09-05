import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getPatientDataRepository } from "@/di/reposetriesDiI";

async function searchImagingHistory({
  patientId,
  bodyPart,
}: {
  patientId: number;
  bodyPart: string;
}) {
  const repo = getPatientDataRepository();
  const imaging = await repo.getImagingData(patientId);

  if (!imaging || imaging.length === 0) {
    return {
      success: false,
      message: `Patient ${patientId} has no Imaging`,
      results: [],
    };
  }

  const searchBodyPart = bodyPart.toLowerCase();

  const matchingRecords = imaging
    .filter((record) => record.bodyPart.toLowerCase().includes(searchBodyPart))
    .map((record) => ({
      documentId: record.documentId,
      bodyPart: record.bodyPart,
      date: record.reportDate,
      report: record.findings,
    }));

  return {
    success: true,
    patientId,
    results: matchingRecords,
    message:
      matchingRecords.length > 0
        ? `${matchingRecords.length} imaging record(s) found.`
        : "No matching imaging records found.",
  };
}

export const search_imaging_history = tool(searchImagingHistory, {
  name: "search_imaging_history",

  description:
    "Search the patient's imaging history for completed diagnostic studies such as X-rays, CT scans, or MRIs. Use this tool to verify whether the patient has undergone imaging of a specific body part required by the prior authorization policy.",

  schema: z.object({
    patientId: z.number().describe("Unique identifier of the patient."),

    bodyPart: z
      .string()
      .describe(
        "Body part to search for imaging studies (e.g. 'Lumbar Spine', 'Cervical Spine', 'Knee').",
      ),
  }),
});
