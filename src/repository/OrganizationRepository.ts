import { IOrganizationsRepository } from "@/lib/interfaces/IRepository/IOrganizationsRepository";
import prismaClient from "@/lib/prisma";
import {
  CreateOrganizationDto,
  OrganizationWithCountsDto,
  UpdateOrganizationDto,
} from "@/types/organizations.dto";
import { IOrganizations } from "@/types/organizations.entity";

export class OrganizationRepository implements IOrganizationsRepository {
  // read ops
  async getAllOrganizationAsync(): Promise<OrganizationWithCountsDto[] | null> {
    try {
      const orgs = await prismaClient.organization.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              users: true,
              patients: true,
            },
          },
        },
      });

      return orgs;
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      return null;
    }
  }

  async getOrganizationByIdAsync(
    orgId: number,
  ): Promise<IOrganizations | null> {
    try {
      const org = await prismaClient.organization.findUnique({
        where: { id: orgId },
      });

      return org;
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      return null;
    }
  }

  // write ops
  async insertOrganizationAsync(
    payload: CreateOrganizationDto,
  ): Promise<boolean> {
    try {
      await prismaClient.organization.create({
        data: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
          type: payload.type,
          isActive: payload.isActive,
          createdBy: payload.createdBy,
        },
      });
      return true;
    } catch (error) {
      console.error("Erroe while insterting data: ", error);
      return false;
    }
  }

  async updateOrganizationByIdAsync(
    orgId: number,
    payload: UpdateOrganizationDto,
  ): Promise<boolean> {
    try {
      await prismaClient.organization.update({
        where: { id: orgId },
        data: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
          type: payload.type,
          isActive: payload.isActive,
        },
      });
      return true;
    } catch (error) {
      console.error("Erroe while update data: ", error);
      return false;
    }
  }

  async deleteOrganizationByIdAsyn(orgId: number): Promise<boolean> {
    try {
      await prismaClient.organization.delete({
        where: { id: orgId },
      });
      return true;
    } catch (error) {
      console.error("Erroe while deleting organisation: ", error);
      return false;
    }
  }
}
