import "next-auth";
import { UserRole } from "@prisma/client";
// import { UserRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: UserRole;
      orgId?: number | null;
    } & DefaultSession["user"];
    accessToken: string;
  }

  interface User extends DefaultUser {
    role: UserRole;
    orgId: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role?: UserRole;
    orgId?: number | null;
    accessToken: string;
  }
}
