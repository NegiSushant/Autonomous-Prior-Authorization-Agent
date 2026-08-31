import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getPatientDataRepository } from "@/di/reposetriesDiI";

async function searchPharmacyRecords({
  patientId,
  medicationCategory,
}: {
  patientId: number;
  medicationCategory: string;
}) {
  const repo = getPatientDataRepository();
  const pharmacy = await repo.getPharmacyRecord(patientId);

  if (!pharmacy || pharmacy.length === 0) {
    return {
      success: false,
      message: `Patient ${patientId} not found.`,
      results: [],
    };
  }

  const category = medicationCategory.toLowerCase();

  const matchingRecords = pharmacy
    .filter((record) => record.category.toLowerCase().includes(category))
    .map((record) => ({
      documentId: record.documentId,
      medication: record.drugName,
      category: record.category,
      date: record.recordDate,
    }));

  return {
    success: true,
    patientId,
    results: matchingRecords,
    message:
      matchingRecords.length > 0
        ? `${matchingRecords.length} pharmacy record(s) found.`
        : "No matching pharmacy records found.",
  };
}

export const search_pharmacy_records = tool(searchPharmacyRecords, {
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
});

// import { tool } from "@langchain/core/tools";
// import { z } from "zod";
// import patients from "../../mocks/patients.json";

// export const search_pharmacy_records = tool(
//   ({ patientId, medicationCategory }) => {
//     const patient = patients.find((p) => p.patientId === patientId);

//     if (!patient) {
//       return {
//         success: false,
//         message: `Patient ${patientId} not found.`,
//         results: [],
//       };
//     }

//     const category = medicationCategory.toLowerCase();

//     const matchingRecords = patient.pharmacy
//       .filter((record) => record.category.toLowerCase().includes(category))
//       .map((record) => ({
//         documentId: record.documentId,
//         medication: record.medication,
//         category: record.category,
//         date: record.date,
//       }));

//     return {
//       success: true,
//       patientId,
//       results: matchingRecords,
//       message:
//         matchingRecords.length > 0
//           ? `${matchingRecords.length} pharmacy record(s) found.`
//           : "No matching pharmacy records found.",
//     };
//   },
//   {
//     name: "search_pharmacy_records",

//     description:
//       "Search the patient's pharmacy records for prescription history. Use this tool to verify whether the patient has been prescribed medications belonging to a specific category (for example, pain medication or anti-inflammatory drugs) as evidence of conservative treatment.",

//     schema: z.object({
//       patientId: z.string().describe("Unique identifier of the patient."),

//       medicationCategory: z
//         .string()
//         .describe(
//           "Medication category to search for (e.g. 'Pain Medication', 'NSAID', 'Muscle Relaxant').",
//         ),
//     }),
//   },
// );
