import { getAccessRequestRepository } from "@/di/reposetriesDiI";
import { IAccessRequestServices } from "@/lib/interfaces/IServices/IAccessRequestServices";
import { CreateAccessRequestDto } from "@/types/access-request.dto";

export class AccessRequestServices implements IAccessRequestServices {
  async createAccessRequest(state: CreateAccessRequestDto): Promise<boolean> {
    try {
      const repo = getAccessRequestRepository();
      await repo.createRequestAccess(state);
      return true;
    } catch (error) {
      console.error(`Error while creating access request for user: ${error}`);
      return false;
    }
  }
}
