import {
  CreateOrganizationDto,
  OrganizationWithCountsDto,
  UpdateOrganizationDto,
} from "@/types/organizations.dto";
import { IOrganizations } from "@/types/organizations.entity";
import { SessionUser } from "@/types/users.dto";

export interface IOrganizationsServices {
  listOrganizations(session: SessionUser): Promise<OrganizationWithCountsDto[] | null>;
  listOrganizationById(session: SessionUser, orgId: number): Promise<IOrganizations | null>;

  createNewOrganization(payload: CreateOrganizationDto): Promise<boolean>;
  updateOrganizationById(
    orgId: number,
    payload: UpdateOrganizationDto,
  ): Promise<boolean>;
  deleteOrganizationById(orgId: number): Promise<boolean>;
}
