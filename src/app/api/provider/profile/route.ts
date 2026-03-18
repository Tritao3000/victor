import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";

const updateProviderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  bio: z.string().max(500).nullable().optional(),
  specialties: z.array(z.string().max(100)).max(20).optional(),
  serviceRadius: z.number().int().min(1).max(200).optional(),
  serviceTypes: z.array(z.enum(["PLUMBING", "ELECTRICAL"])).min(1).optional(),
  availableHours: z.record(z.unknown()).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { serviceProvider: true },
    });

    if (!user?.serviceProvider) {
      return NextResponse.json(
        { error: "Not a service provider" },
        { status: 403 },
      );
    }

    return NextResponse.json(user.serviceProvider);
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { serviceProvider: true },
    });

    if (!user?.serviceProvider) {
      return NextResponse.json(
        { error: "Not a service provider" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsed = updateProviderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { name, phone, bio, specialties, serviceRadius, serviceTypes, availableHours, isActive } = parsed.data;

    const updatedProvider = await prisma.serviceProvider.update({
      where: { id: user.serviceProvider.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(specialties !== undefined && { specialties }),
        ...(serviceRadius !== undefined && { serviceRadius }),
        ...(serviceTypes !== undefined && { serviceTypes }),
        ...(availableHours !== undefined && { availableHours }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedProvider);
  } catch (error) {
    console.error("Error updating provider profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
