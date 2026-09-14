import { IAccessRequestRepository } from "@/lib/interfaces/IRepository/IAccessRequestRepository";
import prismaClient from "@/lib/prisma";
import { CreateAccessRequestDto, mapMonthlyVolumeToLicence, mapOrgType } from "@/types/access-request.dto";

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
          numOfLicenceRequired: mapMonthlyVolumeToLicence(state.numOfLicenceRequired),
        },
      });
      return true;
    } catch (error) {
      console.error(`Error while creating user access request: ${error}`);
      return false;
    }
  }
  //   grantUserAccessRequest(): Promise<boolean>;
}
