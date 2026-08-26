import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const role = session.user.role;
    const organizationId = session.user.orgId;

    // Only ADMIN and SUPERADMIN can call this endpoint
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Build the where clause based on role
    const whereClause = role === "SUPERADMIN" ? {} : { organizationId };

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
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const currentUserRole = session.user.role;

    // Only ADMIN and SUPERADMIN can call this endpoint
    if (currentUserRole !== "ADMIN" && currentUserRole !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { email, password, name, role, organizationId } = body;

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    const existing = await prismaClient.user.findUnique({
      where: { email: email.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        email: email.trim(),
        password: hashed,
        name: name?.trim() || null,
        role: role || "REVIEWER",
        organizationId: organizationId ? Number(organizationId) : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 },
    );
  }
}
