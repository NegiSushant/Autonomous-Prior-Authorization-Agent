console.log("🔥 seed-clinical-from-mocks.ts STARTED");

import "dotenv/config";
import patients from "../src/mocks/patients.json";
import prismaClient from "@/lib/prisma";
// import prismaClient from "../src/lib/prisma";

console.log("🔥 Imports completed");
console.log("🔥 Number of patients:", patients.length);

async function main() {
  console.log("Starting patient seed...");

  for (const p of patients as any[]) {
    try {
      console.log(`Creating patient: ${p.patientId} - ${p.name}`);

      await prismaClient.patient.create({
        data: {
          name: p.name,
          email: p.email || undefined,
          insurancePayer: p.insurancePayer,
          procedureCode: p.procedureCode,
          procedureName: p.procedureName,
          diagnosisCode: p.diagnosisCode,
          organizationId: Number(p.organizationId),

          notes:
            p.ehrNotes && p.ehrNotes.length > 0
              ? {
                  create: p.ehrNotes.map((note: any) => ({
                    documentId: note.documentId,
                    noteDate: new Date(note.date),
                    bodyText: note.text,
                    sourceType: note.sourceType || "EHR",
                  })),
                }
              : undefined,

          medications:
            p.pharmacy && p.pharmacy.length > 0
              ? {
                  create: p.pharmacy.map((med: any) => ({
                    documentId: med.documentId,
                    drugName: med.medication,
                    category: med.category,
                    recordDate: new Date(med.date),
                    status: med.status || "active",
                  })),
                }
              : undefined,

          imagingReports:
            p.imaging && p.imaging.length > 0
              ? {
                  create: p.imaging.map((img: any) => ({
                    documentId: img.documentId,
                    bodyPart: img.bodyPart,
                    findings: img.report,
                    reportDate: new Date(img.date),
                    sourceType: img.sourceType || "Imaging",
                  })),
                }
              : undefined,
        },
      });

      console.log(`✓ Created patient: ${p.patientId}`);
    } catch (error) {
      console.error(`✗ Failed to create patient: ${p.patientId} - ${p.name}`);
      console.error(error);
    }
  }

  console.log("=================================");
  console.log("Patient seed completed.");
  console.log("=================================");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });

// import "dotenv/config";
// import patients from "../src/mocks/patients.json";
// import prismaClient from "../src/lib/prisma";

// async function main() {
//   for (const p of patients as any[]) {
//     await prismaClient.patient.upsert({
//       where: { id: p.patientId },
//       create: {
//         id: p.patientId,
//         name: p.name,
//         insurancePayer: p.insurancePayer,
//         procedureCode: p.procedureCode,
//         procedureName: p.procedureName,
//         diagnosisCode: p.diagnosisCode,
//         organization: {
//           connect: { id: 1 },
//         },
//       },
//       update: {
//         name: p.name,
//         insurancePayer: p.insurancePayer,
//         procedureCode: p.procedureCode,
//         procedureName: p.procedureName,
//         diagnosisCode: p.diagnosisCode,
//       },
//     });

//     // Clinical notes (ehrNotes)
//     for (const note of p.ehrNotes ?? []) {
//       await prismaClient.clinicalNote.create({
//         data: {
//           patientId: p.patientId,
//           documentId: note.documentId,
//           noteDate: note.date,
//           bodyText: note.text,
//           sourceType: "EHR",
//         },
//       });
//     }

//     // Medications (pharmacy)
//     for (const med of p.pharmacy ?? []) {
//       await prismaClient.medicationRecord.create({
//         data: {
//           patientId: p.patientId,
//           documentId: med.documentId,
//           drugName: med.medication,
//           category: med.category,
//           recordDate: med.date,
//           status: "active",
//         },
//       });
//     }

//     // Imaging reports
//     for (const img of p.imaging ?? []) {
//       await prismaClient.imagingReport.create({
//         data: {
//           patientId: p.patientId,
//           documentId: img.documentId,
//           bodyPart: img.bodyPart,
//           findings: img.report,
//           reportDate: img.date,
//           sourceType: "Imaging",
//         },
//       });
//     }
//   }

//   console.log("Seed complete");
// }

// main().finally(() => prismaClient.$disconnect());
