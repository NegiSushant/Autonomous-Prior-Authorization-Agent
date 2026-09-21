import { IAccessRequestRepository } from "@/lib/interfaces/IRepository/IAccessRequestRepository";
import prismaClient from "@/lib/prisma";
import {
  AccessRequestResponseDto,
  CreateAccessRequestDto,
  mapMonthlyVolumeToLicence,
  mapOrgType,
} from "@/types/access-request.dto";
import {
  AccessRequestStatus,
  IAccessRequest,
} from "@/types/access-request.entity";

export class AccessRequestRepository implements IAccessRequestRepository {
  async createRequestAccess(state: CreateAccessRequestDto): Promise<boolean> {
    try {
      await prismaClient.accessRequest.create({
        data: {
          organizationName: state.organizationName,
          domainName: state.domainName,
          email: state.email,
          phone: state.phone,
          address: state.address,
          type: mapOrgType(state.type),
          numOfLicenceRequired: mapMonthlyVolumeToLicence(
            state.numOfLicenceRequired,
          ),
        },
      });
      return true;
    } catch (error) {
      console.error(`Error while creating user access request: ${error}`);
      return false;
    }
  }

  async listUserAccessRequest(): Promise<AccessRequestResponseDto[] | null> {
    try {
      const data = await prismaClient.accessRequest.findMany();
      return data;
    } catch (error) {
      console.error(`Error while listing user access: ${error}`);
      return null;
    }
  }

  async isUserRequestUdateById(
    id: number,
    status: AccessRequestStatus,
    adminNote: string | null,
    approvedBy: string,
  ): Promise<boolean> {
    try {
      await prismaClient.accessRequest.update({
        where: { id: id },
        data: {
          status: status,
          adminNotes: adminNote,
          reviewedBy: approvedBy,
          updatedAt: new Date(),
        },
      });
      return true;
    } catch (error) {
      console.error(`Error while updating status of user access: ${error}`);
      return false;
    }
  }

  async userAccessInfoById(id: number): Promise<IAccessRequest | null> {
    try {
      const info = await prismaClient.accessRequest.findUnique({
        where: { id },
      });
      return info;
    } catch (error) {
      console.error(`Error while retriving user access info: ${error}`);
      return null;
    }
  }
}
