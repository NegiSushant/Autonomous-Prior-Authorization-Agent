import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { getOrganizationsService } from "@/di/servicesDil";

type Params = { params: Promise<{ id: number }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const sessionUser = await requireAuth(["ADMIN", "SUPERADMIN"]);

    const { id } = await params;
    const orgId = Number(id);

    const services = getOrganizationsService();
    const organization = await services.listOrganizationById(
      sessionUser,
      orgId,
    );

    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: organization });
  } catch (error) {
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

export async function PUT(req: Request, { params }: Params) {
  try {
    await requireAuth(["SUPERADMIN"]);

    const { id } = await params;
    const orgId = Number(id);
    const body = await req.json();

    const services = getOrganizationsService();

    const organization = await services.updateOrganizationById(orgId, {
      name: body.name?.trim(),
      type: body.type,
      address: body.address || null,
      phone: body.phone || null,
      email: body.email || null,
      isActive: body.isActive,
    });

    return NextResponse.json({ success: true, data: organization });
  } catch (error) {
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

export async function DELETE(req: Request, { params }: Params) {
  try {
    await requireAuth(["SUPERADMIN"]);

    const { id } = await params;
    const orgId = Number(id);

    const services = getOrganizationsService();
    const isDeleted = await services.deleteOrganizationById(orgId);

    if (!isDeleted) {
      return NextResponse.json(
        { success: false, message: "Failed to delete!" },
        { status: 404 },
      );
    }
  } catch (error) {
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
