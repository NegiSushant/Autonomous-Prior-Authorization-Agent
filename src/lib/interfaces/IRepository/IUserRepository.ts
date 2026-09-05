import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from "@/types/users.dto";

export interface IUserRepository {
  /*-----------------------Read Ops ----------------- */
  getUserByIdAsync(userId: number): Promise<UserResponseDto | null>;

  getFullUserInfoAsync(orgId: number | null): Promise<UserResponseDto[] | null>;

  /*-----------------------Write ops----------------- */
  insertUserDataAsync(payload: CreateUserDto): Promise<boolean>;

  updateUserDataByIdAsync(
    userId: number,
    payload: UpdateUserDto,
  ): Promise<boolean>;

  deleteUserDataByIdAsync(userId: number): Promise<boolean>;
}
