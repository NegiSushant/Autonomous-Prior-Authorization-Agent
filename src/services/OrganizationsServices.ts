import { getOrganizationRepository } from "@/di/reposetriesDiI";
import { IOrganizationsRepository } from "@/lib/interfaces/IRepository/IOrganizationsRepository";
import { IOrganizationsServices } from "@/lib/interfaces/IServices/IOrganizationsService";
import {
  CreateOrganizationDto,
  OrganizationWithCountsDto,
  UpdateOrganizationDto,
} from "@/types/organizations.dto";
import { IOrganizations } from "@/types/organizations.entity";
import { SessionUser } from "@/types/users.dto";

export class OrganizationServices implements IOrganizationsServices {
  private repository: IOrganizationsRepository;

  constructor() {
    this.repository = getOrganizationRepository();
  }

  async listOrganizations(
    session: SessionUser,
  ): Promise<OrganizationWithCountsDto[] | null> {
    try {
      let orgId: number | null = null;
      if (session.role === "ADMIN") {
        orgId = session.orgId;
      }
      const organizations =
        await this.repository.getAllOrganizationAsync(orgId);
      return organizations;
    } catch (error) {
      console.error(`Error while listing organizations: ${error}`);
      return null;
    }
  }

  async listOrganizationById(
    session: SessionUser,
    orgId: number,
  ): Promise<IOrganizations | null> {
    try {
      if (session.orgId !== orgId) {
        console.warn(
          `Unauthorized: ADMIN (Org: ${session.orgId}) tried to access Org: ${orgId}`,
        );
        return null; // Or you can throw an Unauthorized/Forbidden error here
      }
      const orgs = await this.repository.getOrganizationByIdAsync(orgId);
      return orgs;
    } catch (error) {
      console.error(`Error while listing organizations: ${error}`);
      return null;
    }
  }

  async createNewOrganization(
    payload: CreateOrganizationDto,
  ): Promise<boolean> {
    try {
      const isOrgCreated =
        await this.repository.insertOrganizationAsync(payload);
      if (!isOrgCreated) return false;
      return true;
    } catch (error) {
      console.error(`Error while creating new organization: ${error}`);
      return false;
    }
  }

  async updateOrganizationById(
    orgId: number,
    payload: UpdateOrganizationDto,
  ): Promise<boolean> {
    try {
      const isOrgUpdated = await this.repository.updateOrganizationByIdAsync(
        orgId,
        payload,
      );
      if (!isOrgUpdated) return false;
      return true;
    } catch (error) {
      console.error(`Error while updating organization: ${error}`);
      return false;
    }
  }

  async deleteOrganizationById(orgId: number): Promise<boolean> {
    try {
      const isOrgDeleted =
        await this.repository.deleteOrganizationByIdAsyn(orgId);
      if (!isOrgDeleted) return false;
      return true;
    } catch (error) {
      console.error(`Error while deleting organization: ${error}`);
      return false;
    }
  }
}
