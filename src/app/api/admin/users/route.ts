import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { getUserService } from "@/di/servicesDil";

export async function GET() {
  try {
    const user = await requireAuth(["SUPERADMIN", "ADMIN"]);

    const service = getUserService();

    const users = await service.userInfoList(user);

    return NextResponse.json({ success: true, data: users });
  } catch (error: unknown) {
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

export async function POST(req: Request) {
  try {
    await requireAuth(["SUPERADMIN", "ADMIN"]);

    const body = await req.json();
    const { email, password, name, role, organizationId } = body;

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    const services = getUserService();
    const user = await services.createUser({
      email: email.trim(),
      password: password,
      name: name?.trim() || null,
      role: role || "REVIEWER",
      organizationId: organizationId ? Number(organizationId) : 1,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Failed to create user!" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User created successfully!" },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error while creating User: ", error);

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
