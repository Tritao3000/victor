import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      providerId,
      customerId,
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
      !customerId ||
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

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        providerId,
        customerId,
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
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId is required' },
        { status: 400 },
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        customerId,
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
