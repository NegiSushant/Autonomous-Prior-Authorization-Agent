"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var adapter_pg_1 = require("@prisma/adapter-pg");
var client_1 = require("../generated/prisma/client");
var adapter = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
var prismaClient = new client_1.PrismaClient({ adapter: adapter });
// if (process.env.NODE_ENV !== "production") globalForPrisma.prismaClient = prismaClient
//   globalForPrisma.prismaClient = prismaClient;
exports.default = prismaClient;
