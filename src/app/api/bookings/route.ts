import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { BookingStatus, BookingUrgency } from '@prisma/client';
import { calculateEstimate } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Support both new Uber-style flow and legacy flow
    const isUberFlow = body.serviceCategoryId && body.serviceType;

    if (isUberFlow) {
      const {
        serviceType,
        serviceCategoryId,
        urgency,
        scheduledFor,
        address,
        city,
        state,
        zipCode,
        problemDescription,
        locationNotes,
        estimatedPrice,
      } = body;

      if (
        !serviceType ||
        !serviceCategoryId ||
        !scheduledFor ||
        !address ||
        !city ||
        !state ||
        !zipCode ||
        !problemDescription ||
        estimatedPrice === undefined
      ) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Verify category exists
      const category = await prisma.serviceCategory.findUnique({
        where: { id: serviceCategoryId },
      });

      if (!category) {
        return NextResponse.json({ error: 'Service category not found' }, { status: 404 });
      }

      // Verify price matches server calculation
      const serverPrice = calculateEstimate(
        category.basePrice,
        (urgency || 'SCHEDULED') as BookingUrgency
      );

      const booking = await prisma.booking.create({
        data: {
          customerId: session.user.id,
          serviceType,
          serviceCategoryId,
          urgency: (urgency || 'SCHEDULED') as BookingUrgency,
          scheduledFor: new Date(scheduledFor),
          address,
          city,
          state,
          zipCode,
          problemDescription,
          locationNotes: locationNotes || null,
          estimatedPrice: serverPrice,
          status: BookingStatus.REQUESTED,
        },
        include: {
          serviceCategory: true,
        },
      });

      return NextResponse.json(booking, { status: 201 });
    }

    // Legacy flow (old marketplace-style)
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

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

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

export async function GET() {
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
        serviceCategory: true,
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
