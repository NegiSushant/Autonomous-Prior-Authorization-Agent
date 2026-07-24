import { tool } from "@langchain/core/tools";
import patients from "../../mocks/patients.json";
import z from "zod";

export const search_pharmacy_records = tool(
  ({ patientId, medicationCategory }) => {
    const patient = patients.find((p) => p.patientId === patientId);

    if (!patient) {
      return {
        success: false,
        message: `Patient ${patientId} not found.`,
        results: [],
      };
    }

    const category = medicationCategory.toLowerCase();
    const matchingRecords = patient.pharmacy.filter((record) =>
      record.category.toLowerCase().includes(category),
    );

    return {
      success: true,
      patientId,
      results: matchingRecords,
      message:
        matchingRecords.length > 0
          ? `${matchingRecords.length} pharmacy record(s) found.`
          : "No matching pharmacy records found.",
    };
  },
  {
    name: "search_pharmacy_records",
    description:
      "Search the patient's pharmacy records for prescription history. Use this tool to verify whether the patient has been prescribed medications belonging to a specific category (for example, pain medication or anti-inflammatory drugs) as evidence of conservative treatment.",

    schema: z.object({
      patientId: z.string().describe("Unique identifier of the patient."),

      medicationCategory: z
        .string()
        .describe(
          "Medication category to search for (e.g. 'Pain Medication', 'NSAID', 'Muscle Relaxant').",
        ),
    }),
  },
);
