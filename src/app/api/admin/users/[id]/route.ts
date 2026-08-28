import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getUserRepository } from "@/di/reposetriesDiI";

type Params = { params: Promise<{ id: number }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const repo = getUserRepository();
    const user = await repo.getUserByIdAsync(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error while retrive patient info: ", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request, { params }: Params) {
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

    const { id } = await params;
    const userId = Number(id);
    const body = await req.json();
    const { email, password, name, role, organizationId } = body;

    // const data: Record<string, unknown> = {
    //   email: email?.trim(),
    //   name: name?.trim() || null,
    //   role: role || "REVIEWER",
    //   organizationId: organizationId ? Number(organizationId) : null,
    // };

    // if (password?.trim()) {
    //   data.password = await bcrypt.hash(password, 10);
    // }

    const repo = getUserRepository();
    const user = await repo.updateUserDataByIdAsync(userId, {
      email: email?.trim(),
      name: name?.trim() || null,
      role: role || "REVIEWER",
      organizationId: organizationId ? Number(organizationId) : null,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Failed to update user" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User updated successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
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

    const { id } = await params;
    const userId = Number(id);
    const repo = getUserRepository();

    const isUserDeleted = await repo.deleteUserDataByIdAsync(userId);

    if (!isUserDeleted) {
      return NextResponse.json(
        { success: false, message: "Failed to delete user" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User deleted Successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 },
    );
  }
}
