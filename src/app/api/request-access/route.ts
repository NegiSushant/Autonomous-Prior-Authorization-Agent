import { getAccessRequestServices } from "@/di/servicesDil";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      organizationName,
      domainName,
      email,
      phone,
      address,
      type,
      numOfLicenceRequired,
    } = body;

    // ---------- Validation ----------
    if (!organizationName?.trim()) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 },
      );
    }
    if (!domainName?.trim()) {
      return NextResponse.json(
        { error: "Domain name is required" },
        { status: 400 },
      );
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }
    if (!phone?.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }
    if (!address?.trim()) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 },
      );
    }
    if (!["HOSPITAL", "CLINIC", "LAB", "OTHER"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid organization type" },
        { status: 400 },
      );
    }
    if (!["<100", "100-500", "500+"].includes(numOfLicenceRequired)) {
      return NextResponse.json(
        { error: "Invalid monthly volume" },
        { status: 400 },
      );
    }

    // prevent duplicate pending requests for the same email
    // const existing = accessRequests.find(
    //   (r) => r.email.toLowerCase() === email.toLowerCase() && r.status === "PENDING",
    // );
    // if (existing) {
    //   return NextResponse.json(
    //     {
    //       error: "A pending access request already exists for this email",
    //     },
    //     { status: 409 },
    //   );
    // }

    // ---------- Create request ----------
    const newRequest = {
      organizationName: organizationName.trim(),
      domainName: domainName.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      type,
      numOfLicenceRequired,
      status: "PENDING" as const,
    };

    const services = getAccessRequestServices();

    const isRequestCreated = await services.createAccessRequest(newRequest);

    if (!isRequestCreated) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
    console.log("New access request received:", newRequest);

    return NextResponse.json({
      success: true,
      message:
        "Access request submitted successfully. Our team will review it shortly.",
    });
  } catch (error) {
    console.error("Error in /api/request-access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const services = getAccessRequestServices();

    const data = await services.listAllAccessRequestUser();

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error in /api/request-access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
