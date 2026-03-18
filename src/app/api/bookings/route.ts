import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { BookingStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      serviceId,
      providerId,
      scheduledFor,
      address,
      city,
      state,
      zipCode,
      problemDescription,
      locationNotes,
      quotedPrice,
    } = body;

    // Validate required fields
    if (
      !serviceId ||
      !providerId ||
      !scheduledFor ||
      !address ||
      !city ||
      !state ||
      !zipCode ||
      !problemDescription ||
      quotedPrice === undefined
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Create booking using session user as customer
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        providerId,
        customerId: session.user.id,
        serviceType: service.serviceType,
        estimatedPrice: quotedPrice,
        scheduledFor: new Date(scheduledFor),
        address,
        city,
        state,
        zipCode,
        problemDescription,
        locationNotes: locationNotes || null,
        quotedPrice,
        status: BookingStatus.REQUESTED,
      },
      include: {
        service: true,
        provider: true,
        customer: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: session.user.id,
      },
      include: {
        service: true,
        provider: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 },
    );
  }
}
