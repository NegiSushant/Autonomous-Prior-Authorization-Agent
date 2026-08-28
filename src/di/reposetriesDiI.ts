import { IOrganizationsRepository } from "@/lib/interfaces/IRepository/IOrganizationsRepository";
import { IPatientDataRepository } from "@/lib/interfaces/IRepository/IPatientDataRepository";
import { OrganizationRepository } from "@/repository/OrganizationRepository";
import { PatientDataRepository } from "@/repository/PatientDataRepository";

let patientDataRepository: IPatientDataRepository | null = null;
let organisationRepository: IOrganizationsRepository | null = null;

export function getPatientDataRepository(): IPatientDataRepository {
  if (!patientDataRepository) {
    patientDataRepository = new PatientDataRepository();
  }
  return patientDataRepository;
}

export function getOrganizationRepository(): IOrganizationsRepository {
  if (!organisationRepository) {
    organisationRepository = new OrganizationRepository();
  }
  return organisationRepository;
}
