import { CreateAccessRequestDto } from "@/types/access-request.dto";

export interface IAccessRequestRepository {
  createRequestAccess(state: CreateAccessRequestDto): Promise<boolean>;
//   grantUserAccessRequest(): Promise<boolean>;
}
