import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { BookingStatus } from '@prisma/client';
import { findBestProvider } from '@/lib/matching';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the user owns this booking
    if (booking.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Only REQUESTED bookings can be matched
    if (booking.status !== BookingStatus.REQUESTED && booking.status !== BookingStatus.MATCHING) {
      return NextResponse.json(
        { error: 'Booking is not in a matchable state' },
        { status: 400 }
      );
    }

    // Set to MATCHING
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.MATCHING },
    });

    // Find best provider
    const match = await findBestProvider(
      booking.serviceType,
      booking.city,
      [] // Could pass previously declined providers
    );

    if (!match) {
      // No provider found, keep as MATCHING for retry
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          matchAttempts: { increment: 1 },
        },
      });

      return NextResponse.json({
        matched: false,
        message: 'No available providers found. Will retry.',
      });
    }

    // Assign provider and set to MATCHING (waiting for provider acceptance)
    const updatedBooking = await prisma.booking.update({
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
      },
    });

    return NextResponse.json({
      matched: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error matching booking:', error);
    return NextResponse.json(
      { error: 'Failed to match booking' },
      { status: 500 }
    );
  }
}
