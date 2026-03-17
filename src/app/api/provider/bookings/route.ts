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

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");

    const bookings = await prisma.booking.findMany({
      where: {
        providerId: user.serviceProvider.id,
        ...(status && { status: status as any }),
      },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        scheduledFor: "asc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching provider bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}
