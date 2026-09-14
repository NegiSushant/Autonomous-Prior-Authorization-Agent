import { getAccessRequestRepository } from "@/di/reposetriesDiI";
import { IAccessRequestRepository } from "@/lib/interfaces/IRepository/IAccessRequestRepository";
import { IAccessRequestServices } from "@/lib/interfaces/IServices/IAccessRequestServices";
import { AccessRequestResponseDto, CreateAccessRequestDto } from "@/types/access-request.dto";

export class AccessRequestServices implements IAccessRequestServices {
  private repository: IAccessRequestRepository;

  constructor() {
    this.repository = getAccessRequestRepository();
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
}
