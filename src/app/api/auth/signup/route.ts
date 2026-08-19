import prismaClient from "@/lib/prisma";
import { CreateUserSchema } from "@/types/uitypes";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parseData = CreateUserSchema.safeParse(body);

  if (!parseData.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Data Validation Failed!",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const name = parseData.data.name;
    const email = parseData.data.email;
    const password = parseData.data.password;

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        email: email,
        password: hashPassword,
        name: name,
        organizationId: 1,
      },
    });

    return NextResponse.json({
      userId: user.id,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      message: "Something went wrong",
    });
  }
}
