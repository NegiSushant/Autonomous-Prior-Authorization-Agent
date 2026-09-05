import { IAgentsDataRepository } from "@/lib/interfaces/IRepository/IAgentsDataRepository";
import { IOrganizationsRepository } from "@/lib/interfaces/IRepository/IOrganizationsRepository";
import { IPatientDataRepository } from "@/lib/interfaces/IRepository/IPatientDataRepository";
import { IUserRepository } from "@/lib/interfaces/IRepository/IUserRepository";
import { AgentsDataRepository } from "@/repository/AgentsDataRepository";
import { OrganizationRepository } from "@/repository/OrganizationRepository";
import { PatientDataRepository } from "@/repository/PatientDataRepository";
import { UserRepository } from "@/repository/UserRepository";

let patientDataRepository: IPatientDataRepository | null = null;
let organisationRepository: IOrganizationsRepository | null = null;
let userRepository: IUserRepository | null = null;
let agentRAGRepository: IAgentsDataRepository | null = null;

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

export function getUserRepository(): IUserRepository {
  if (!userRepository) {
    userRepository = new UserRepository();
  }
  return userRepository;
}

export function getAgentRAGRepository(): IAgentsDataRepository {
  if (!agentRAGRepository) {
    agentRAGRepository = new AgentsDataRepository();
  }
  return agentRAGRepository;
}
