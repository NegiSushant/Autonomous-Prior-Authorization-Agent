import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
// import { Resend } from "resend";
import redis from "@/lib/redis";

// const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // ---------- Rate Limit: Max 3 OTP requests per email per hour ----------
    const sendKey = `otp:send:${normalizedEmail}`;
    const sendCount = await redis.incr(sendKey);

    if (sendCount === 1) {
      await redis.expire(sendKey, 3600); // 1 hour
    }

    if (sendCount > 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many OTP requests. Please try again after 1 hour.",
        },
        { status: 429 },
      );
    }

    // ---------- Generate 6-digit secure OTP ----------
    const otp = crypto.randomInt(100000, 999999).toString();

    // ---------- Store OTP in Redis (5 minutes expiry) ----------
    const otpKey = `otp:code:${normalizedEmail}`;
    await redis.set(otpKey, otp, "EX", 300); // 5 minutes

    // ---------- Reset verification attempts ----------
    await redis.del(`otp:attempts:${normalizedEmail}`);

    // ---------- Send Email via Resend ----------
    // const { error } = await resend.emails.send({
    //   from: "APA Agent <onboarding@resend.dev>", // Change later to your verified domain
    //   to: normalizedEmail,
    //   subject: "Your Verification Code",
    //   html: `
    //     <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
    //       <h2 style="color: #1e293b;">Verification Code</h2>
    //       <p style="color: #475569; font-size: 15px;">
    //         Use the following code to verify your email address. This code will expire in <strong>5 minutes</strong>.
    //       </p>
    //       <div style="margin: 24px 0; padding: 16px 24px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
    //         <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">
    //           ${otp}
    //         </span>
    //       </div>
    //       <p style="color: #94a3b8; font-size: 13px;">
    //         If you didn’t request this code, you can safely ignore this email.
    //       </p>
    //     </div>
    //   `,
    // });

    // if (error) {
    //   console.error("Resend error:", error);
    //   return NextResponse.json(
    //     { success: false, error: "Failed to send email. Please try again." },
    //     { status: 500 },
    //   );
    // }

    // Still log in development for convenience
    if (process.env.NODE_ENV === "development") {
      console.log(`📧 OTP for ${normalizedEmail}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
