import "dotenv/config";
import patients from "../src/mocks/patients.json";
import prismaClient from "../src/lib/prisma";

async function main() {
  for (const p of patients as any[]) {
    await prismaClient.patient.upsert({
      where: { id: p.patientId },
      create: {
        id: p.patientId,
        name: p.name,
        insurancePayer: p.insurancePayer,
        procedureCode: p.procedureCode,
        procedureName: p.procedureName,
        diagnosisCode: p.diagnosisCode,
      },
      update: {
        name: p.name,
        insurancePayer: p.insurancePayer,
        procedureCode: p.procedureCode,
        procedureName: p.procedureName,
        diagnosisCode: p.diagnosisCode,
      },
    });

    // Clinical notes (ehrNotes)
    for (const note of p.ehrNotes ?? []) {
      await prismaClient.clinicalNote.create({
        data: {
          patientId: p.patientId,
          documentId: note.documentId,
          noteDate: note.date,
          bodyText: note.text,
          sourceType: "EHR",
        },
      });
    }

    // Medications (pharmacy)
    for (const med of p.pharmacy ?? []) {
      await prismaClient.medicationRecord.create({
        data: {
          patientId: p.patientId,
          documentId: med.documentId,
          drugName: med.medication,
          category: med.category,
          recordDate: med.date,
          status: "active",
        },
      });
    }

    // Imaging reports
    for (const img of p.imaging ?? []) {
      await prismaClient.imagingReport.create({
        data: {
          patientId: p.patientId,
          documentId: img.documentId,
          bodyPart: img.bodyPart,
          findings: img.report,
          reportDate: img.date,
          sourceType: "Imaging",
        },
      });
    }
  }

  console.log("Seed complete");
}

main().finally(() => prismaClient.$disconnect());
