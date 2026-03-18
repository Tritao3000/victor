import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

/**
 * Refund rules:
 * - REQUESTED / MATCHING (before provider match): Full refund
 * - MATCHED / PROVIDER_EN_ROUTE (after match, before arrival): 50% refund
 * - IN_PROGRESS: No refund
 * - COMPLETED: No refund
 */

const FULL_REFUND_STATUSES = ["REQUESTED", "MATCHING"];
const PARTIAL_REFUND_STATUSES = ["MATCHED", "PROVIDER_EN_ROUTE"];
const PARTIAL_REFUND_PERCENT = 50;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, reason } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }

    if (booking.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!booking.payment) {
      return NextResponse.json(
        { error: "No payment exists for this booking" },
        { status: 400 },
      );
    }

    if (
      booking.payment.status === "REFUNDED" ||
      booking.payment.status === "CANCELLED"
    ) {
      return NextResponse.json(
        { error: "Payment already refunded or cancelled" },
        { status: 409 },
      );
    }

    // Determine refund amount based on booking status
    let refundAmount: number;
    const bookingStatus = booking.status;

    if (FULL_REFUND_STATUSES.includes(bookingStatus)) {
      refundAmount = booking.payment.amount;
    } else if (PARTIAL_REFUND_STATUSES.includes(bookingStatus)) {
      refundAmount = Math.round(
        booking.payment.amount * (PARTIAL_REFUND_PERCENT / 100),
      );
    } else {
      return NextResponse.json(
        {
          error:
            "Refund not available. Jobs that are in progress or completed cannot be refunded.",
        },
        { status: 400 },
      );
    }

    // Issue refund via Stripe
    await stripe.refunds.create({
      payment_intent: booking.payment.stripePaymentIntentId,
      amount: refundAmount,
      reason: "requested_by_customer",
      metadata: {
        bookingId: booking.id,
        refundReason: reason || "Customer cancellation",
      },
    });

    // Update payment record
    const isFullRefund = refundAmount >= booking.payment.amount;
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: {
        status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
        refundedAmount: refundAmount,
        refundReason: reason || "Customer cancellation",
        refundedAt: new Date(),
      },
    });

    // Cancel the booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      refunded: true,
      refundAmount,
      isFullRefund,
      bookingStatus: "CANCELLED",
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 },
    );
  }
}
