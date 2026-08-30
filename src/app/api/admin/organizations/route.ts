import { NextResponse } from "next/server";
import { getOrganizationsService } from "@/di/servicesDil";
import { requireAuth } from "@/lib/requireAuth";

export async function GET() {
  try {
    const sessionUser = await requireAuth(["ADMIN", "SUPERADMIN"]);

    const services = getOrganizationsService();
    const organizations = await services.listOrganizations(sessionUser);

    return NextResponse.json({ success: true, data: organizations });
  } catch (error: unknown) {
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
    const sessionUser = await requireAuth(["SUPERADMIN"]);

    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    const services = getOrganizationsService();

    const success = await services.createNewOrganization({
      name: body.name.trim(),
      type: body.type || "DEMO",
      address: body.address || null,
      phone: body.phone || null,
      email: body.email || null,
      isActive: body.isActive ?? true,
      createdBy: sessionUser.email || "system",
    });

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create organization",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Organization Created Successfully!",
    });
  } catch (error: unknown) {
    console.error(error);

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
