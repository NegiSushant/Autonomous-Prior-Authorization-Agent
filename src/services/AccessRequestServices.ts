import { getAccessRequestRepository } from "@/di/reposetriesDiI";
import { getOrganizationsService } from "@/di/servicesDil";
import { AccessRequestStatus } from "@/generated/prisma/enums";
import { IAccessRequestRepository } from "@/lib/interfaces/IRepository/IAccessRequestRepository";
import { IAccessRequestServices } from "@/lib/interfaces/IServices/IAccessRequestServices";
import { IOrganizationsServices } from "@/lib/interfaces/IServices/IOrganizationsService";
import {
  AccessRequestResponseDto,
  CreateAccessRequestDto,
} from "@/types/access-request.dto";
import { CreateOrganizationDto } from "@/types/organizations.dto";
import { SessionUser } from "@/types/users.dto";
import bcrypt from "bcrypt";
import crypto from "crypto";

export class AccessRequestServices implements IAccessRequestServices {
  private repository: IAccessRequestRepository;
  private orgServices: IOrganizationsServices;

  constructor() {
    this.repository = getAccessRequestRepository();
    this.orgServices = getOrganizationsService();
  }

  async createAccessRequest(state: CreateAccessRequestDto): Promise<boolean> {
    try {
      await this.repository.createRequestAccess(state);
      return true;
    } catch (error) {
      console.error(`Error while creating access request for user: ${error}`);
      return false;
    }
  }

  async listAllAccessRequestUser(): Promise<AccessRequestResponseDto[] | null> {
    try {
      const userList = await this.repository.listUserAccessRequest();
      return userList;
    } catch (error) {
      console.error(`Error while listing user access: ${error}`);
      return null;
    }
  }

  async actionOnAccessRequest(
    status: AccessRequestStatus,
    adminNotes: string | null,
    id: number,
    session: SessionUser,
  ): Promise<boolean> {
    try {
      const reviewer = session.email;
      //check the status
      // if status === approved then create admin for the perticuler orgs
      if (status !== "APPROVED") {
        // just update status in the db
        await this.repository.isUserRequestUdateById(
          id,
          status,
          adminNotes,
          reviewer,
        );
        return true;
      }
      // update stauts and return the user info
      const isAccessRequestUpdated =
        await this.repository.isUserRequestUdateById(
          id,
          status,
          adminNotes,
          reviewer,
        );

      if (!isAccessRequestUpdated) return false;

      const requestInfo = await this.repository.userAccessInfoById(id);

      if (requestInfo === null) {
        // roll back the user staus
        await this.repository.isUserRequestUdateById(
          id,
          (status = "PENDING"),
          (adminNotes = null),
          reviewer,
        );
        return false;
      }
      // create random 6-8 word password

      // const password = crypto.randomInt(100000, 999999).toString();
      const password = generatePassword();
      const hashPassword = await bcrypt.hash(password, 10);

      // create the organization and admin user for the orgs
      const orgsPayload: CreateOrganizationDto = {
        name: requestInfo.organizationName,
        type: requestInfo.type,
        address: requestInfo.address,
        phone: requestInfo.phone,
        email: requestInfo.email,
        domain: requestInfo.domainName,
        createdBy: reviewer,
      };

      const createOrga =
        await this.orgServices.createNewOrganization(orgsPayload);

      // const isUserAdminCreated = await

      // send message to the user with the

      return true;
    } catch (error) {
      return false;
    }
  }
}

const generatePassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 8; i++) {
    const index = crypto.randomInt(0, characters.length);
    password += characters[index];
  }
  return password;
};
