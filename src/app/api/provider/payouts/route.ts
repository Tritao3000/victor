import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { centsToEuros } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get provider profile linked to this user
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

    const providerId = user.serviceProvider.id;

    // Get all payments for this provider's completed bookings
    const payments = await prisma.payment.findMany({
      where: {
        booking: { providerId },
        status: { in: ["CAPTURED", "REFUNDED", "PARTIALLY_REFUNDED"] },
      },
      include: {
        booking: {
          select: {
            id: true,
            problemDescription: true,
            completedAt: true,
            scheduledFor: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate summary
    const totalEarnings = payments.reduce(
      (sum, p) => sum + p.providerPayout,
      0,
    );
    const totalRefunded = payments.reduce(
      (sum, p) => sum + p.refundedAmount,
      0,
    );
    const pendingPayouts = payments.filter(
      (p) => p.status === "CAPTURED" && p.booking.status !== "COMPLETED",
    );
    const completedPayouts = payments.filter(
      (p) => p.status === "CAPTURED" && p.booking.status === "COMPLETED",
    );

    return NextResponse.json({
      summary: {
        totalEarnings: centsToEuros(totalEarnings),
        totalRefunded: centsToEuros(totalRefunded),
        netEarnings: centsToEuros(totalEarnings - totalRefunded),
        pendingCount: pendingPayouts.length,
        completedCount: completedPayouts.length,
      },
      payouts: payments.map((p) => ({
        id: p.id,
        bookingId: p.bookingId,
        amount: centsToEuros(p.providerPayout),
        platformFee: centsToEuros(p.platformFee),
        totalCharged: centsToEuros(p.amount),
        status: p.status,
        bookingStatus: p.booking.status,
        description: p.booking.problemDescription,
        scheduledFor: p.booking.scheduledFor,
        completedAt: p.booking.completedAt,
        capturedAt: p.capturedAt,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 },
    );
  }
}
