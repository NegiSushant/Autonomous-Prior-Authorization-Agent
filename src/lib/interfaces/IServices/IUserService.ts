import {
  CreateUserDto,
  SessionUser,
  UpdateUserDto,
  UserResponseDto,
} from "@/types/users.dto";

export interface IUserServices {
  ListUserInfoById(userId: number): Promise<UserResponseDto | null>;

  userInfoList(session: SessionUser): Promise<UserResponseDto[] | null>;

  createUser(payload: CreateUserDto): Promise<boolean>;

  updateUserDataById(
    userId: number,
    payload: UpdateUserDto,
  ): Promise<boolean>;

  deleteUserById(userId: number): Promise<boolean>;
}
