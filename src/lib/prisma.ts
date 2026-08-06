import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prismaClient = new PrismaClient({ adapter });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prismaClient = prismaClient
//   globalForPrisma.prismaClient = prismaClient;

export default prismaClient;
