export type UserRole = "SUPERADMIN" | "ADMIN" | "REVIEWER";

export interface IUser {
  id: number;
  email: string;
  password: string;
  name: string | null;
  role: UserRole;
  organizationId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// export interface IPriorAuthReview {
//   id: number;
//   patientId: string;
//   agentRecommendation: string;
//   agentStatus: string;
//   finalDecision: string;
//   reviewerNote: string | null;
//   agentResultJson: Record<string, any>;
//   overridesJson: Record<string, any>;
//   createdAt: Date;
//   updatedAt: Date;
//   reviewerId: number | null;
// }
