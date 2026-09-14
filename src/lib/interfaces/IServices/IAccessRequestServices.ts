import { CreateAccessRequestDto } from "@/types/access-request.dto";

export interface IAccessRequestServices {
  createAccessRequest(state: CreateAccessRequestDto): Promise<boolean>;
}
