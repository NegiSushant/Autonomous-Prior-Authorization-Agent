import { IPriorAuthReview, IUser, UserRole } from "./users.entity";

export interface CreateUserDto extends Omit<
  IUser,
  "id" | "createdAt" | "updatedAt" | "role"
> {
  role?: UserRole;
}

export type UpdateUserDto = Partial<
  Omit<IUser, "id" | "createdAt" | "updatedAt">
>;

export interface UserResponseDto extends Omit<IUser, "password"> {
  reviews?: IPriorAuthReview[];
}

// 3. PRIOR AUTH REVIEW DTOs
export type CreatePriorAuthReviewDto = Omit<
  IPriorAuthReview,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdatePriorAuthReviewDto = Partial<
  Omit<IPriorAuthReview, "id" | "createdAt" | "updatedAt">
>;

export interface PriorAuthReviewResponseDto extends IPriorAuthReview {
  reviewer?: Omit<IUser, "password">;
}

// 4. QUERY PARAMETERS / FILTER DTOs
export interface GetUsersFilterDto {
  page?: number;
  limit?: number;
  role?: UserRole;
  organizationId?: number;
  searchTerm?: string;
}

export interface GetReviewsFilterDto {
  page?: number;
  limit?: number;
  patientId?: string;
  reviewerId?: number;
  agentStatus?: string;
  finalDecision?: string;
}
