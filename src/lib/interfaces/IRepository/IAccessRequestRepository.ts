import {
  AccessRequestResponseDto,
  CreateAccessRequestDto,
} from "@/types/access-request.dto";
import {
  AccessRequestStatus,
  IAccessRequest,
} from "@/types/access-request.entity";

export interface IAccessRequestRepository {
  createRequestAccess(state: CreateAccessRequestDto): Promise<boolean>;
  listUserAccessRequest(): Promise<AccessRequestResponseDto[] | null>;
  isUserRequestUdateById(
    id: number,
    status: AccessRequestStatus,
    adminNote: string | null,
    approvedBy: string,
  ): Promise<boolean>;

  userAccessInfoById(id: number): Promise<IAccessRequest | null>;
}
