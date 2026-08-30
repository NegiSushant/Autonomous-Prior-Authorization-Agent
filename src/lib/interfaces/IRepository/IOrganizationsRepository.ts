import {
  CreateOrganizationDto,
  OrganizationWithCountsDto,
  UpdateOrganizationDto,
} from "@/types/organizations.dto";
import { IOrganizations } from "@/types/organizations.entity";

export interface IOrganizationsRepository {
  // read ops
  getAllOrganizationAsync(
    orgId: number | null,
  ): Promise<OrganizationWithCountsDto[] | null>;
  getOrganizationByIdAsync(orgId: number): Promise<IOrganizations | null>;

  // write ops
  insertOrganizationAsync(payload: CreateOrganizationDto): Promise<boolean>;
  updateOrganizationByIdAsync(
    orgId: number,
    payload: UpdateOrganizationDto,
  ): Promise<boolean>;
  deleteOrganizationByIdAsyn(orgId: number): Promise<boolean>;
}
