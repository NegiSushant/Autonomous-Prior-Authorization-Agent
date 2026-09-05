import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getPatientDataRepository } from "@/di/reposetriesDiI";

async function searchEhrNotes({
  patientId,
  keywords,
}: {
  patientId: number;
  keywords: string;
}) {
  const repo = getPatientDataRepository();

  // const patient = patients.find((p) => p.patientId === patientId);
  const notes = await repo.getEHRNoteData(patientId);

  if (!notes || notes.length === 0) {
    return {
      success: false,
      message: `Patient ${patientId} not found or has no notes.`,
      results: [],
    };
  }

  const keyword = keywords.toLowerCase();

  const matchingNotes = notes
    .filter((note) => note.bodyText.toLowerCase().includes(keyword))
    .map((note) => ({
      documentId: note.documentId,
      date: note.noteDate,
      text: note.bodyText,
    }));

  return {
    success: true,
    patientId,
    results: matchingNotes,
  };
}

export const search_ehr_notes = tool(searchEhrNotes, {
  name: "search_ehr_notes",
  description:
    "Search the patient's clinical EHR notes for documentation related to treatments, diagnoses, symptoms, or completed conservative therapy. Use this tool when verifying whether required clinical evidence exists.",
  schema: z.object({
    patientId: z.number().describe("Unique identifier of the patient."),
    keywords: z
      .string()
      .describe(
        "Keyword or phrase to search within the patient's clinical notes (e.g. 'physical therapy', 'back pain', 'completed').",
      ),
  }),
});
