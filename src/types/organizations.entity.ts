export type OrgType = "DEMO" | "HOSPITAL" | "CLINIC" | "OTHERS";

export interface IOrganizations {
  id: number;
  name: string;
  type: OrgType;
  address: string | null;
  phone: string  | null;
  email: string;
  domain: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
