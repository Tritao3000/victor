import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";

const onboardingSchema = z.object({
  phone: z.string().min(1).max(20),
  bio: z.string().max(500).optional(),
  serviceTypes: z.array(z.enum(["PLUMBING", "ELECTRICAL"])).min(1),
  specialties: z.array(z.string().max(100)).max(20).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  serviceRadius: z.number().int().min(1).max(200).optional(),
  licenseNumber: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const parsed = onboardingSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { phone, bio, serviceTypes, specialties, city, state, serviceRadius, licenseNumber } = parsed.data;

    const user = session.user;

    // Check if user already has a service provider record
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { serviceProviderId: true },
    });
    if (existingUser?.serviceProviderId) {
      return NextResponse.json(
        { error: "Already onboarded as a service provider" },
        { status: 409 },
      );
    }

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
