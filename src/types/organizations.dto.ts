import { IOrganizations, OrgType } from "./organizations.entity";
import { IPatient } from "./patient.entity";

export interface CreateOrganizationDto extends Omit<
  IOrganizations,
  "id" | "createdAt" | "updatedAt" | "type" | "isActive"
> {
  type?: OrgType;
  isActive?: boolean;
}

/**
 * UPDATE DTO
 * - Omits id, createdAt, updatedAt, and createdBy (audit fields shouldn't change).
 * - Wraps the rest in Partial<> so all fields become optional (you only send what you want to update).
 */
export type UpdateOrganizationDto = Partial<
  Omit<IOrganizations, "id" | "createdAt" | "updatedAt" | "createdBy">
>;

export interface OrganizationWithCountsDto extends IOrganizations {
  _count: {
    users: number;
    patients: number;
  };
}

/**
 * RESPONSE DTO
 * - Used when returning an organization alongside its related Users or Patients.
 * - (Assumes you have IUser and IPatient interfaces defined elsewhere)
 */
export interface OrganizationFullResponseDto extends IOrganizations {
  //   users?: any[];
  patients?: IPatient[];
}

/**
 * FILTER / QUERY DTO
 * - Used for GET requests to filter lists of organizations (e.g., in a dashboard table).
 */
export interface GetOrganizationsFilterDto {
  page?: number;
  limit?: number;
  searchTerm?: string;
  type?: OrgType;
  isActive?: boolean;
}
