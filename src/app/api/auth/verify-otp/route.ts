import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import redis from "@/lib/redis";

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // ---------- Rate Limit: Max 5 verification attempts per day ----------
    const attemptKey = `otp:attempts:${normalizedEmail}`;
    const attempts = await redis.incr(attemptKey);

    if (attempts === 1) {
      await redis.expire(attemptKey, 86400); // 24 hours
    }

    if (attempts > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed attempts. Please try again tomorrow.",
        },
        { status: 429 }
      );
    }

    // ---------- Get stored OTP ----------
    const otpKey = `otp:code:${normalizedEmail}`;
    const storedOtp = await redis.get(otpKey);

    if (!storedOtp) {
      return NextResponse.json(
        {
          success: false,
          error: "OTP expired or not found. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // ---------- Compare OTP ----------
    if (storedOtp !== otp) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid OTP. Please try again.",
          attemptsLeft: 5 - attempts,
        },
        { status: 400 }
      );
    }

    // ---------- Success: Clean up ----------
    await redis.del(otpKey); // One-time use
    await redis.del(attemptKey); // Reset attempts

    // Optional: You can also set a short-lived "email verified" flag
    await redis.set(`otp:verified:${normalizedEmail}`, "true", "EX", 600); // 10 min

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}