import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { SessionUser } from "@/types/users.dto";
import { UserRole } from "@/types/users.entity";


export async function requireAuth(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  const user = session.user as SessionUser;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      throw new Error("FORBIDDEN");
    }
  }

  return user;
}