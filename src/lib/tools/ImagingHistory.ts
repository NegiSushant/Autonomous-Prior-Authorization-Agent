import { tool } from "@langchain/core/tools";
import { z } from "zod";
import patients from "../../mocks/patients.json";

export const search_imaging_history = tool(
  ({ patientId, bodyPart }) => {
    const patient = patients.find((p) => p.patientId === patientId);

    if (!patient) {
      return {
        success: false,
        message: `Patient ${patientId} not found.`,
        results: [],
      };
    }

    const searchBodyPart = bodyPart.toLowerCase();

    const matchingRecords = patient.imaging
      .filter((record) =>
        record.bodyPart.toLowerCase().includes(searchBodyPart),
      )
      .map((record) => ({
        documentId: record.documentId,
        bodyPart: record.bodyPart,
        date: record.date,
        report: record.report,
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
  },
  {
    name: "search_imaging_history",

    description:
      "Search the patient's imaging history for completed diagnostic studies such as X-rays, CT scans, or MRIs. Use this tool to verify whether the patient has undergone imaging of a specific body part required by the prior authorization policy.",

    schema: z.object({
      patientId: z.string().describe("Unique identifier of the patient."),

      bodyPart: z
        .string()
        .describe(
          "Body part to search for imaging studies (e.g. 'Lumbar Spine', 'Cervical Spine', 'Knee').",
        ),
    }),
  },
);
