import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { BookingStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

    const { id } = await context.params;
    const body = await req.json();
    const { status, finalPrice, notes } = body;

    // Verify booking belongs to this provider
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.providerId !== user.serviceProvider.id) {
      return NextResponse.json(
        { error: "Not authorized to update this booking" },
        { status: 403 },
      );
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status: status as BookingStatus }),
        ...(finalPrice !== undefined && { finalPrice }),
        ...(notes !== undefined && { notes }),
        ...(status === BookingStatus.COMPLETED && { completedAt: new Date() }),
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
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
