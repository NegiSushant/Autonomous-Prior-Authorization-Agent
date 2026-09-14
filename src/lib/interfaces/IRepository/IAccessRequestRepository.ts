import { AccessRequestResponseDto, CreateAccessRequestDto } from "@/types/access-request.dto";

export interface IAccessRequestRepository {
  createRequestAccess(state: CreateAccessRequestDto): Promise<boolean>;
  listUserAccessRequest(): Promise<AccessRequestResponseDto[] | null>;
}
