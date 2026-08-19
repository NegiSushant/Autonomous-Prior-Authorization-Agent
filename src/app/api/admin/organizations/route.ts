import { authOptions } from "@/auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();
    const organizations = await prismaClient.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, data: organizations });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status =
      msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    const organization = await prismaClient.organization.create({
      data: {
        name: body.name.trim(),
        type: body.type || "DEMO",
        address: body.address || null,
        phone: body.phone || null,
        email: body.email || null,
        isActive: body.isActive ?? true,
        createdBy: session.user.email || session.user.name || "system",
      },
    });

    return NextResponse.json({ success: true, data: organization });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to create organization" },
      { status: 500 },
    );
  }
}
