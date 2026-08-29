import { IPatientDataService } from "@/lib/interfaces/IServices/IPatientInfoService";

export class PatientDataService implements IPatientDataService {
  async getPatient(patientId: string) {
    const p = await prismaClient.patient.findUnique({
      where: { id: patientId },
    });
    return p ? toPatient(p) : null;
  }

  async listPatients() {
    const rows = await prismaClient.patient.findMany({
      orderBy: { id: "asc" },
    });
    return rows.map(toPatient);
  }

  async searchNotes(patientId: string, keywords: string) {
    const terms = keywords
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const notes = await prismaClient.clinicalNote.findMany({
      where: { patientId },
      orderBy: { noteDate: "desc" },
    });

    const filtered =
      terms.length === 0
        ? notes
        : notes.filter((n) => {
            const text = n.bodyText.toLowerCase();
            return terms.some((t) => text.includes(t));
          });

    return filtered.map(
      (n): ClinicalEvidenceRow => ({
        documentId: n.documentId,
        dateFound: n.noteDate,
        snippetText: n.bodyText,
        sourceType: n.sourceType || "EHR",
      }),
    );
  }

  async searchMedications(patientId: string, medicationCategory: string) {
    const category = medicationCategory.toLowerCase();
    const rows = await prismaClient.medicationRecord.findMany({
      where: { patientId },
      orderBy: { recordDate: "desc" },
    });

    const filtered = rows.filter(
      (r) =>
        r.category.toLowerCase().includes(category) ||
        r.drugName.toLowerCase().includes(category),
    );

    return filtered.map(
      (r): ClinicalEvidenceRow => ({
        documentId: r.documentId,
        dateFound: r.recordDate,
        snippetText: `${r.drugName} (${r.category}) — ${r.status}`,
        sourceType: "Pharmacy",
        status: r.status,
      }),
    );
  }

  async searchImaging(patientId: string, bodyPart: string) {
    const part = bodyPart.toLowerCase();
    const rows = await prismaClient.imagingReport.findMany({
      where: { patientId },
      orderBy: { reportDate: "desc" },
    });

    const filtered = rows.filter(
      (r) =>
        r.bodyPart.toLowerCase().includes(part) ||
        r.findings.toLowerCase().includes(part),
    );

    return filtered.map(
      (r): ClinicalEvidenceRow => ({
        documentId: r.documentId,
        dateFound: r.reportDate,
        snippetText: r.findings,
        sourceType: r.sourceType || "Imaging",
      }),
    );
  }
}

export const patientDataService: IPatientDataService =
  new PostgresDataService();
