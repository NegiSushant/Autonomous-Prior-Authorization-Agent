import { IPatientDataRepository } from "@/lib/interfaces/IRepository/IPatientDataRepository";
import { PatientDataRepository } from "@/repository/PatientDataRepository";

let patientDataRepository: IPatientDataRepository | null = null;

export function getPatientDataRepository(): IPatientDataRepository {
  if (!patientDataRepository) {
    patientDataRepository = new PatientDataRepository();
  }
  return patientDataRepository;
}
