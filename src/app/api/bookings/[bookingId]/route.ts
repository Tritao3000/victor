import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { bookingId } = await params;

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
    const { bookingId } = await params;
    const body = await request.json();
    const { status, scheduledFor } = body;

    // Build update data object
    const updateData: {
      status?: BookingStatus;
      scheduledFor?: Date;
      completedAt?: Date | null;
    } = {};

    if (status) {
      updateData.status = status;
      // If status is completed, set completedAt
      if (status === BookingStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }
    }

    if (scheduledFor) {
      updateData.scheduledFor = new Date(scheduledFor);
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        service: true,
        provider: true,
        customer: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 },
    );
  }
}
