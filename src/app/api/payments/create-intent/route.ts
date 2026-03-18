import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, calculateFees, eurosToCents } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 },
      );
    }

    // Fetch booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, provider: true },
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

    if (booking.payment) {
      return NextResponse.json(
        { error: "Payment already exists for this booking" },
        { status: 409 },
      );
    }

    if (booking.status !== "REQUESTED") {
      return NextResponse.json(
        { error: "Booking is not in a payable state" },
        { status: 400 },
      );
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    let stripeCustomerId = user?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        name: user?.name || undefined,
        metadata: { victorUserId: session.user.id },
      });
      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Calculate amounts
    const price = booking.estimatedPrice || booking.quotedPrice;
    if (!price) {
      return NextResponse.json(
        { error: "Booking has no price set" },
        { status: 400 },
      );
    }
    const amountCents = eurosToCents(price);
    const { platformFee, providerPayout } = calculateFees(amountCents);

    // Build PaymentIntent params
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountCents,
      currency: "eur",
      customer: stripeCustomerId,
      metadata: {
        bookingId: booking.id,
        victorPlatformFee: platformFee.toString(),
        victorProviderPayout: providerPayout.toString(),
      },
    };

    // If provider has a connected account, set up the transfer
    if (booking.provider?.stripeConnectedAccountId) {
      paymentIntentParams.application_fee_amount = platformFee;
      paymentIntentParams.transfer_data = {
        destination: booking.provider.stripeConnectedAccountId,
      };
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams,
    );

    // Store payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: amountCents,
        platformFee,
        providerPayout,
        currency: "eur",
        status: "REQUIRES_PAYMENT",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountCents,
      platformFee,
      providerPayout,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 },
    );
  }
}
