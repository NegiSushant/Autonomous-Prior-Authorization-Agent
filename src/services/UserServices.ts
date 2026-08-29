import { getUserRepository } from "@/di/reposetriesDiI";
import { IUserRepository } from "@/lib/interfaces/IRepository/IUserRepository";
import { IUserServices } from "@/lib/interfaces/IServices/IUserService";
import {
  CreateUserDto,
  SessionUser,
  UpdateUserDto,
  UserResponseDto,
} from "@/types/users.dto";
import bcrypt from "bcrypt";

export class UserServices implements IUserServices {
  private repository: IUserRepository;

  constructor() {
    this.repository = getUserRepository();
  }

  async ListUserInfoById(userId: number): Promise<UserResponseDto | null> {
    try {
      const users = await this.repository.getUserByIdAsync(userId);
      return users;
    } catch (error) {
      console.error("Error while retriving user: ", error);
      return null;
    }
  }

  async userInfoList(
    session: SessionUser,
  ): Promise<UserResponseDto[] | null> {
    try {
      let orgId: number | null = null;
      if (session.role === "ADMIN") {
        orgId = session.orgId;
      }

      const users = await this.repository.getFullUserInfoAsync(orgId);

      return users;
    } catch (error) {
      console.error("Error while retriving users: ", error);
      return null;
    }
  }

  async createUser(payload: CreateUserDto): Promise<boolean> {
    try {
      const password = payload.password;
      const hashPassword = await bcrypt.hash(password, 10);

      await this.repository.insertUserDataAsync({
        email: payload.email,
        password: hashPassword,
        name: payload.name,
        role: payload.role,
        organizationId: payload.organizationId,
      });
      return true;
    } catch (error) {
      console.error("Error while creating new user: ", error);
      return false;
    }
  }

  async updateUserDataById(
    userId: number,
    payload: UpdateUserDto,
  ): Promise<boolean> {
    try {
      await this.repository.updateUserDataByIdAsync(userId, payload);
      return true;
    } catch (error) {
      console.error("Error while update user: ", error);
      return false;
    }
  }

  async deleteUserById(userId: number): Promise<boolean> {
    try {
      await this.repository.deleteUserDataByIdAsync(userId);
      return true;
    } catch (error) {
      console.error("Error while deleting user: ", error);
      return false;
    }
  }
}
