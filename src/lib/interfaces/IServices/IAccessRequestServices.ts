import { AccessRequestResponseDto, CreateAccessRequestDto } from "@/types/access-request.dto";

export interface IAccessRequestServices {
  createAccessRequest(state: CreateAccessRequestDto): Promise<boolean>;
  listAllAccessRequestUser():Promise<AccessRequestResponseDto[] | null>
}
