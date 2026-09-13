import { NextResponse } from "next/server";
import redis from "@/lib/redis"; // adjust path if needed

export async function GET() {
  try {
    await redis.set("test-key", "hello from redis", "EX", 10);
    const value = await redis.get("test-key");

    return NextResponse.json({
      success: true,
      value,
      message: "Redis is working!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
