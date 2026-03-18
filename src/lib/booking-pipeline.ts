import { prisma } from './prisma';
import { BookingStatus } from '@prisma/client';
import { findBestProvider } from './matching';
import { stripe, calculateFees, eurosToCents } from './stripe';
import { sendProviderMatchedEmail, sendBookingCancelledEmail } from './email';
import { logger } from './logger';

const MAX_MATCH_ATTEMPTS = 3;
const PROVIDER_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Trigger matching for a booking. Finds the best available provider
 * (excluding declined ones) and assigns them, or cancels if max attempts reached.
 *
 * Returns the updated booking.
 */
export async function triggerMatching(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking) throw new Error('Booking not found');

  // Check if max attempts reached
  if (booking.matchAttempts >= MAX_MATCH_ATTEMPTS) {
    return cancelBookingNoProvider(bookingId);
  }

  const match = await findBestProvider(
    booking.serviceType,
    booking.city,
    booking.declinedProviderIds,
  );

  if (!match) {
    // No providers available — cancel
    return cancelBookingNoProvider(bookingId);
  }

  // Assign provider, set to MATCHING (waiting for acceptance)
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      providerId: match.providerId,
      matchedAt: new Date(),
      matchAttempts: { increment: 1 },
      status: BookingStatus.MATCHING,
    },
    include: {
      provider: true,
      serviceCategory: true,
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Notify provider of new booking request
  if (updated.provider) {
    sendProviderMatchedEmail({
      bookingId,
      serviceType: updated.serviceCategory?.name ?? updated.serviceType,
      address: updated.address,
      city: updated.city,
      scheduledFor: updated.scheduledFor,
      estimatedPrice: updated.estimatedPrice,
      customerName: updated.customer.name || 'Customer',
      customerEmail: updated.customer.email,
      providerName: updated.provider.name,
      providerEmail: updated.provider.email,
    });
  }

  return { matched: true, booking: updated };
}

/**
 * Cancel a booking because no provider could be found.
 * Releases payment hold if one exists.
 */
async function cancelBookingNoProvider(bookingId: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
    },
    include: {
      payment: true,
      serviceCategory: true,
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Release payment hold if exists
  if (booking.payment?.stripePaymentIntentId) {
    try {
      await stripe.paymentIntents.cancel(booking.payment.stripePaymentIntentId);
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: 'CANCELLED' },
      });
    } catch (err) {
      logger.error('Failed to cancel payment intent', err);
    }
  }

  // Notify customer about cancellation
  sendBookingCancelledEmail({
    bookingId,
    serviceType: booking.serviceCategory?.name ?? booking.serviceType,
    address: booking.address,
    city: booking.city,
    scheduledFor: booking.scheduledFor,
    estimatedPrice: booking.estimatedPrice,
    customerName: booking.customer.name || 'Customer',
    customerEmail: booking.customer.email,
  });

  return {
    matched: false,
    booking,
    message: 'No available providers found. Booking cancelled.',
  };
}

/**
 * Create a payment intent with manual capture for a booking.
 * Called during booking creation to hold funds upfront.
 */
export async function createPaymentHold(bookingId: string, customerId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, provider: true },
  });

  if (!booking) throw new Error('Booking not found');
  if (booking.payment) return booking.payment; // already exists

  const price = booking.estimatedPrice || booking.quotedPrice;
  if (!price) throw new Error('Booking has no price set');

  // Get or create Stripe customer
  const user = await prisma.user.findUnique({
    where: { id: customerId },
  });

  let stripeCustomerId = user?.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user?.email,
      name: user?.name || undefined,
      metadata: { victorUserId: customerId },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: customerId },
      data: { stripeCustomerId: customer.id },
    });
  }

  const amountCents = eurosToCents(price);
  const { platformFee, providerPayout } = calculateFees(amountCents);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'eur',
    customer: stripeCustomerId,
    capture_method: 'manual',
    metadata: {
      bookingId: booking.id,
      victorPlatformFee: platformFee.toString(),
      victorProviderPayout: providerPayout.toString(),
    },
  });

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      stripePaymentIntentId: paymentIntent.id,
      amount: amountCents,
      platformFee,
      providerPayout,
      currency: 'eur',
      status: 'REQUIRES_PAYMENT',
    },
  });

  return { payment, clientSecret: paymentIntent.client_secret };
}

/**
 * Capture a held payment when a job is completed.
 */
export async function capturePayment(bookingId: string) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!payment) return null;

  try {
    await stripe.paymentIntents.capture(payment.stripePaymentIntentId);
    return prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CAPTURED',
        capturedAt: new Date(),
      },
    });
  } catch (err) {
    logger.error('Failed to capture payment', err);
    return null;
  }
}

/**
 * Release (cancel) a held payment when a booking is cancelled.
 */
export async function releasePayment(bookingId: string) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!payment) return null;

  try {
    await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CANCELLED' },
    });
  } catch (err) {
    logger.error('Failed to release payment', err);
    return null;
  }
}

/**
 * Check if a MATCHING booking has timed out (provider didn't accept in 5 min).
 * If so, auto-decline and re-match. Returns the booking (possibly updated).
 *
 * This is called lazily on booking GET requests.
 */
export async function checkProviderTimeout(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) return null;
  if (booking.status !== BookingStatus.MATCHING) return booking;
  if (!booking.matchedAt || !booking.providerId) return booking;

  const elapsed = Date.now() - booking.matchedAt.getTime();
  if (elapsed < PROVIDER_TIMEOUT_MS) return booking;

  // Timed out — auto-decline this provider
  const declinedProviderId = booking.providerId;
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      providerId: null,
      matchedAt: null,
      providerAcceptedAt: null,
      declinedProviderIds: {
        push: declinedProviderId,
      },
      status: BookingStatus.REQUESTED,
    },
  });

  // Re-trigger matching
  const result = await triggerMatching(bookingId);
  return result.booking;
}
