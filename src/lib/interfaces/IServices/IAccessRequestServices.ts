import {
  AccessRequestResponseDto,
  CreateAccessRequestDto,
} from "@/types/access-request.dto";
import { AccessRequestStatus } from "@/types/access-request.entity";
import { SessionUser } from "@/types/users.dto";

export interface IAccessRequestServices {
  createAccessRequest(state: CreateAccessRequestDto): Promise<boolean>;
  listAllAccessRequestUser(): Promise<AccessRequestResponseDto[] | null>;
  actionOnAccessRequest(
    status: AccessRequestStatus,
    adminNotes: string | null,
    id: number,
    session: SessionUser
  ): Promise<boolean>;
}
