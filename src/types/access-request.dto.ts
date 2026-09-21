import {
  IAccessRequest,
  RequiredLicence,
  AccessRequestStatus,
} from "./access-request.entity";
import { OrgType } from "./organizations.entity";

// Create
export type CreateAccessRequestDto = Omit<
  IAccessRequest,
  "id" | "status" | "adminNotes" | "createdAt" | "updatedAt" | "reviewedBy"
>;

// Update (Admin side)
export interface UpdateAccessRequestDto {
  status?: AccessRequestStatus;
  adminNotes?: string | null;
  reviewedBy?: string | null;
}

// Optional: allow partial update of the original form fields too
export type UpdateAccessRequestFullDto = Partial<CreateAccessRequestDto> &
  UpdateAccessRequestDto;

// Response
export type AccessRequestResponseDto = IAccessRequest;

// List / Filter helpers (optional but useful)
export interface AccessRequestListQueryDto {
  status?: AccessRequestStatus;
  type?: OrgType;
  email?: string;
  page?: number;
  limit?: number;
}

export const mapMonthlyVolumeToLicence = (value: string): RequiredLicence => {
  const map: Record<string, RequiredLicence> = {
    "<100": "LESS_THAN_100",
    "100-500": "BETWEEN_100_500",
    "500+": "MORE_THAN_500",
  };

  const result = map[value];
  if (!result) {
    throw new Error(`Invalid monthly volume: ${value}`);
  }
  return result;
};

export const mapOrgType = (value: string): OrgType => {
  const map: Record<string, OrgType> = {
    HOSPITAL: "HOSPITAL",
    CLINIC: "CLINIC",
    LAB: "OTHERS", // or create a LAB value in the enum if you prefer
    OTHER: "OTHERS",
    OTHERS: "OTHERS",
    DEMO: "DEMO",
  };

  const result = map[value];
  if (!result) {
    throw new Error(`Invalid organization type: ${value}`);
  }
  return result;
};
