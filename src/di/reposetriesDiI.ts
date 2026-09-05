import { IAgentRAGRepository } from "@/lib/interfaces/IRepository/IAgentRAGRepository";
import { IOrganizationsRepository } from "@/lib/interfaces/IRepository/IOrganizationsRepository";
import { IPatientDataRepository } from "@/lib/interfaces/IRepository/IPatientDataRepository";
import { IUserRepository } from "@/lib/interfaces/IRepository/IUserRepository";
import { AgentRAGRepository } from "@/repository/AgentRAGRepository";
import { OrganizationRepository } from "@/repository/OrganizationRepository";
import { PatientDataRepository } from "@/repository/PatientDataRepository";
import { UserRepository } from "@/repository/UserRepository";

let patientDataRepository: IPatientDataRepository | null = null;
let organisationRepository: IOrganizationsRepository | null = null;
let userRepository: IUserRepository | null = null;
let agentRAGRepository: IAgentRAGRepository | null = null;

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

export function getAgentRAGRepository(): IAgentRAGRepository {
  if (!agentRAGRepository) {
    agentRAGRepository = new AgentRAGRepository();
  }
  return agentRAGRepository;
}
