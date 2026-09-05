import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { getUserService } from "@/di/servicesDil";

type Params = { params: Promise<{ id: number }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAuth(["SUPERADMIN", "ADMIN"]);

    const { id } = await params;
    const userId = Number(id);

    const services = getUserService();
    const userInfo = await services.ListUserInfoById(userId);

    return NextResponse.json({ success: true, data: userInfo });
  } catch (error) {
    console.error("Error while retrive User info: ", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await requireAuth(["SUPERADMIN", "ADMIN"]);

    const { id } = await params;
    const userId = Number(id);
    const body = await req.json();
    const { email, password, name, role, organizationId } = body;

    const services = getUserService();

    const user = await services.updateUserDataById(userId, {
      email: email?.trim(),
      name: name?.trim() || null,
      role: role || "REVIEWER",
      organizationId: organizationId ? Number(organizationId) : null,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Failed to update user!" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User updated successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while updated User info: ", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAuth(["SUPERADMIN", "ADMIN"]);

    const { id } = await params;
    const userId = Number(id);

    const services = getUserService();
    const isUserDeleted = await services.deleteUserById(userId);

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
    console.error("Error while Delete User: ", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
