import { tool } from "@langchain/core/tools";
import { z } from "zod";
import patients from "../../mocks/patients.json";

export const search_ehr_notes = tool(
  ({ patientId, keywords }) => {
    const patient = patients.find((p) => p.patientId === patientId);

    if (!patient) {
      return {
        success: false,
        message: `Patient ${patientId} not found.`,
        results: [],
      };
    }

    const keyword = keywords.toLowerCase();

    const matchingNotes = patient.ehrNotes
      .filter((note) => note.text.toLowerCase().includes(keyword))
      .map((note) => ({
        documentId: note.documentId,
        date: note.date,
        text: note.text,
      }));

    return {
      success: true,
      patientId,
      results: matchingNotes,
    };
  },
  {
    name: "search_ehr_notes",

    description:
      "Search the patient's clinical EHR notes for documentation related to treatments, diagnoses, symptoms, or completed conservative therapy. Use this tool when verifying whether required clinical evidence exists.",

    schema: z.object({
      patientId: z.string().describe("Unique identifier of the patient."),

      keywords: z
        .string()
        .describe(
          "Keyword or phrase to search within the patient's clinical notes (e.g. 'physical therapy', 'back pain', 'completed').",
        ),
    }),
  },
);
