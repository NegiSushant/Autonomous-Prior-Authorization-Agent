import { IUserRepository } from "@/lib/interfaces/IRepository/IUserRepository";
import prismaClient from "@/lib/prisma";
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from "@/types/users.dto";

export class UserRepository implements IUserRepository {
  /*-----------------------Read Ops ----------------- */
  async getUserByIdAsync(userId: number): Promise<UserResponseDto | null> {
    try {
      const users = await prismaClient.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
          organization: { select: { id: true, name: true } },
        },
      });

      return users;
    } catch (error) {
      console.error("Error while fetching the User: ", error);
      return null;
    }
  }

  async getFullUserInfoAsync(
    orgId: number | null,
  ): Promise<UserResponseDto[] | null> {
    try {
      const whereClause: { organizationId?: number } =
        orgId !== null ? { organizationId: orgId } : {};

      const users = await prismaClient.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
          organization: {
            select: { id: true, name: true },
          },
        },
      });
      return users;
    } catch (error) {
      console.error("Error while fetching the User: ", error);
      return null;
    }
  }

  /*-----------------------Write ops----------------- */
  async insertUserDataAsync(payload: CreateUserDto): Promise<boolean> {
    try {
      await prismaClient.user.create({
        data: {
          email: payload.email,
          password: payload.password,
          name: payload.name,
          role: payload.role,
          organizationId: payload.organizationId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
        },
      });
      return true;
    } catch (error) {
      console.error("Error while creating new user: ", error);
      return false;
    }
  }

  async updateUserDataByIdAsync(
    userId: number,
    payload: UpdateUserDto,
  ): Promise<boolean> {
    try {
      await prismaClient.user.update({
        where: { id: userId },
        data: {
          email: payload.email,
          name: payload.name,
          role: payload.role,
          organizationId: payload.organizationId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
        },
      });
      return true;
    } catch (error) {
      console.error("Error while updating user: ", error);
      return false;
    }
  }

  async deleteUserDataByIdAsync(userId: number): Promise<boolean> {
    try {
      await prismaClient.user.delete({ where: { id: userId } });
      return true;
    } catch (error) {
      console.error("Error while deleting user: ", error);
      return false;
    }
  }
}
