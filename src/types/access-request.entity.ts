import { OrgType } from "./organizations.entity";

export type RequiredLicence =
  | "LESS_THAN_100"
  | "BETWEEN_100_500"
  | "MORE_THAN_500";

export type AccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IAccessRequest {
  id: number;
  organizationName: string;
  domainName: string;
  email: string;
  phone: string;
  address: string;
  type: OrgType;
  numOfLicenceRequired: RequiredLicence;
  status: AccessRequestStatus;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy: string | null;
}
