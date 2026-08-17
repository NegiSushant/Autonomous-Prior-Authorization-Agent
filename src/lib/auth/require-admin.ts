import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import prismaClient from "@/lib/prisma";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prismaClient.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}
