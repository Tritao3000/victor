import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

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
    const {
      name,
      phone,
      bio,
      specialties,
      serviceRadius,
      serviceTypes,
      availableHours,
      isActive,
    } = body;

    const updatedProvider = await prisma.serviceProvider.update({
      where: { id: user.serviceProvider.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(bio !== undefined && { bio }),
        ...(specialties && { specialties }),
        ...(serviceRadius && { serviceRadius }),
        ...(serviceTypes && { serviceTypes }),
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
