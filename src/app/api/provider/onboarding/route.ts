import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const {
      phone,
      bio,
      serviceTypes,
      specialties,
      city,
      state,
      serviceRadius,
      licenseNumber,
    } = data;

    if (!phone || !serviceTypes?.length || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const user = session.user;

    const serviceProvider = await prisma.serviceProvider.create({
      data: {
        email: user.email,
        name: user.name || "",
        phone,
        bio,
        serviceTypes,
        specialties: specialties || [],
        city,
        state,
        serviceRadius: serviceRadius || 25,
        licenseNumber,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "SERVICE_PROVIDER",
        serviceProviderId: serviceProvider.id,
      },
    });

    return NextResponse.json({ success: true, providerId: serviceProvider.id });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
