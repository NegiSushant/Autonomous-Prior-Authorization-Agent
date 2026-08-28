import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getOrganizationRepository } from "@/di/reposetriesDiI";

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

    const repo = getOrganizationRepository();
    const organization = await repo.getOrganizationByIdAsync(id);

    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: organization });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const orgId = Number(id);
    const body = await req.json();

    const repo = getOrganizationRepository();

    const organization = await repo.updateOrganizationByIdAsync(orgId, {
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
    return NextResponse.json(
      { success: false, message: "Failed to update" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const orgId = Number(id);

    const repo = getOrganizationRepository();
    const isDeleted = await repo.deleteOrganizationByIdAsyn(orgId);

    if (!isDeleted) {
      return NextResponse.json(
        { success: false, message: "Failed to delete!" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to delete!" },
      { status: 500 },
    );
  }
}
