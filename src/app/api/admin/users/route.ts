import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getUserRepository } from "@/di/reposetriesDiI";

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
    // const organizationId = session.user.orgId;

    // Only ADMIN and SUPERADMIN can call this endpoint
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Build the where clause based on role
    // const whereClause = role === "SUPERADMIN" ? {} : { organizationId };
    const repo = getUserRepository();

    const users = await repo.getFullUserInfoAsync();

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
    const repo = getUserRepository();
    const hashed = await bcrypt.hash(password, 10);


    const user = await repo.insertUserDataAsync({
      email: email.trim(),
      password: hashed,
      name: name?.trim() || null,
      role: role || "REVIEWER",
      organizationId: organizationId ? Number(organizationId) : null,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Failed to create user" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User created successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 },
    );
  }
}
