import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { BookingStatus } from '@prisma/client';
import { checkProviderTimeout, releasePayment } from '@/lib/booking-pipeline';
import { sendBookingCancelledEmail } from '@/lib/email';

interface RouteParams {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;

    // Check for provider timeout (lazy evaluation) before fetching
    await checkProviderTimeout(bookingId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        provider: true,
        customer: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the user is either the customer or the provider
    if (booking.customerId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { serviceProvider: true },
      });
      if (!user?.serviceProvider || user.serviceProvider.id !== booking.providerId) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;

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

    const body = await request.json();
    const { status, scheduledFor } = body;

    // Build update data object
    const updateData: {
      status?: BookingStatus;
      scheduledFor?: Date;
      completedAt?: Date | null;
    } = {};

    if (status) {
      // Customers can only cancel
      if (status === BookingStatus.CANCELLED) {
        if (booking.status !== 'REQUESTED' && booking.status !== 'MATCHING' && booking.status !== 'MATCHED') {
          return NextResponse.json(
            { error: 'Cannot cancel a booking that is in progress or completed' },
            { status: 400 },
          );
        }
        updateData.status = status;
      } else {
        return NextResponse.json(
          { error: 'Invalid status transition' },
          { status: 400 },
        );
      }
    }

    if (scheduledFor) {
      if (booking.status !== 'REQUESTED' && booking.status !== 'MATCHING') {
        return NextResponse.json(
          { error: 'Cannot reschedule a booking that is in progress or completed' },
          { status: 400 },
        );
      }
      updateData.scheduledFor = new Date(scheduledFor);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        service: true,
        serviceCategory: true,
        provider: true,
        customer: true,
      },
    });

    // Release payment hold and notify customer if booking was cancelled
    if (updateData.status === BookingStatus.CANCELLED) {
      await releasePayment(bookingId);

      sendBookingCancelledEmail({
        bookingId,
        serviceType: updatedBooking.serviceCategory?.name ?? updatedBooking.service?.name ?? booking.serviceType,
        address: updatedBooking.address,
        city: updatedBooking.city,
        scheduledFor: updatedBooking.scheduledFor,
        estimatedPrice: updatedBooking.estimatedPrice,
        customerName: updatedBooking.customer?.name || 'Customer',
        customerEmail: updatedBooking.customer?.email || '',
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 },
    );
  }
}
