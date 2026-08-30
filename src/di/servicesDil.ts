import { IOrganizationsServices } from "@/lib/interfaces/IServices/IOrganizationsService";
import { IPatientInfoService } from "@/lib/interfaces/IServices/IPatientInfoService";
import { IUserServices } from "@/lib/interfaces/IServices/IUserService";
import { OrganizationServices } from "@/services/OrganizationsServices";
import { PatientInfoServices } from "@/services/PatientInfoServices";
import { UserServices } from "@/services/UserServices";

let userServiceInstance: IUserServices | null = null;
let patientServiceInstance: IPatientInfoService | null = null;
let orgsServiceInstance: IOrganizationsServices | null = null;

export function getUserService(): IUserServices {
  if (!userServiceInstance) {
    userServiceInstance = new UserServices();
  }
  return userServiceInstance;
}

export function getPatientrService(): IPatientInfoService {
  if (!patientServiceInstance) {
    patientServiceInstance = new PatientInfoServices();
  }
  return patientServiceInstance;
}

export function getOrganizationsService(): IOrganizationsServices {
  if (!orgsServiceInstance) {
    orgsServiceInstance = new OrganizationServices();
  }
  return orgsServiceInstance;
}
