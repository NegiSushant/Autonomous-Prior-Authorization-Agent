import "dotenv/config";
import prismaClient from "@/lib/prisma";
import { SignInSchema } from "@/types/uitypes";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// access tokens
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parseData = SignInSchema.safeParse(body);

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
    const email = parseData.data.email;
    const password = parseData.data.password;

    const isUserExist = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!isUserExist) {
      return NextResponse.json({
        message: "User does not exist!",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      isUserExist.password,
    );

    if (!isPasswordMatch) {
      return NextResponse.json({
        message: "Wrong credentials!",
      });
    }

    // generate short lived access token for 15 min
    const accessToken = jwt.sign(
      { userId: isUserExist.id },
      JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    // Long lived refrece token for 7 days
    const refreshToken = jwt.sign(
      { userId: isUserExist.id },
      JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );
    return NextResponse.json({
      accessToken,
      refreshToken,
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      message: "Something went wrong",
    });
  }
}
