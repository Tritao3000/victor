import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { BookingStatus } from "@prisma/client";
import { triggerMatching, capturePayment } from "@/lib/booking-pipeline";
import {
  sendProviderAcceptedEmail,
  sendProviderEnRouteEmail,
  sendJobCompletedEmail,
} from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const { id } = await context.params;
    const body = await req.json();
    const { action, status, finalPrice, notes } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.providerId !== user.serviceProvider.id) {
      return NextResponse.json(
        { error: "Not authorized to update this booking" },
        { status: 403 },
      );
    }

    // Handle Uber-style accept/decline actions
    if (action === 'accept') {
      if (booking.status !== BookingStatus.MATCHING) {
        return NextResponse.json(
          { error: "Booking is not in MATCHING state" },
          { status: 400 },
        );
      }
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.MATCHED,
          providerAcceptedAt: new Date(),
          quotedPrice: booking.estimatedPrice,
        },
        include: {
          service: true,
          serviceCategory: true,
          provider: true,
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      // Notify customer that provider accepted
      sendProviderAcceptedEmail({
        bookingId: id,
        serviceType: updatedBooking.serviceCategory?.name ?? updatedBooking.serviceType,
        address: updatedBooking.address,
        city: updatedBooking.city,
        scheduledFor: updatedBooking.scheduledFor,
        estimatedPrice: updatedBooking.estimatedPrice,
        customerName: updatedBooking.customer.name || 'Customer',
        customerEmail: updatedBooking.customer.email,
        providerName: updatedBooking.provider?.name,
        providerEmail: updatedBooking.provider?.email,
      });

      return NextResponse.json(updatedBooking);
    }

    if (action === 'decline') {
      if (booking.status !== BookingStatus.MATCHING) {
        return NextResponse.json(
          { error: "Booking is not in MATCHING state" },
          { status: 400 },
        );
      }

      // Record the declined provider and reset for re-matching
      await prisma.booking.update({
        where: { id },
        data: {
          providerId: null,
          matchedAt: null,
          providerAcceptedAt: null,
          status: BookingStatus.REQUESTED,
          declinedProviderIds: {
            push: user.serviceProvider.id,
          },
        },
      });

      // Auto-retry matching with declined provider excluded
      const matchResult = await triggerMatching(id);

      return NextResponse.json(matchResult);
    }

    if (action === 'en_route') {
      if (booking.status !== BookingStatus.MATCHED) {
        return NextResponse.json(
          { error: "Booking is not in MATCHED state" },
          { status: 400 },
        );
      }
      const eta = new Date();
      eta.setMinutes(eta.getMinutes() + 30);
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.PROVIDER_EN_ROUTE,
          estimatedArrival: eta,
        },
        include: {
          service: true,
          serviceCategory: true,
          provider: true,
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      // Notify customer that provider is on the way
      sendProviderEnRouteEmail({
        bookingId: id,
        serviceType: updatedBooking.serviceCategory?.name ?? updatedBooking.serviceType,
        address: updatedBooking.address,
        city: updatedBooking.city,
        scheduledFor: updatedBooking.scheduledFor,
        estimatedPrice: updatedBooking.estimatedPrice,
        customerName: updatedBooking.customer.name || 'Customer',
        customerEmail: updatedBooking.customer.email,
        providerName: updatedBooking.provider?.name,
        providerEmail: updatedBooking.provider?.email,
        estimatedArrival: eta,
      });

      return NextResponse.json(updatedBooking);
    }

    if (action === 'start') {
      if (booking.status !== BookingStatus.PROVIDER_EN_ROUTE) {
        return NextResponse.json(
          { error: "Provider must be en route first" },
          { status: 400 },
        );
      }
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.IN_PROGRESS },
        include: {
          service: true,
          serviceCategory: true,
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });
      return NextResponse.json(updatedBooking);
    }

    if (action === 'complete') {
      if (booking.status !== BookingStatus.IN_PROGRESS) {
        return NextResponse.json(
          { error: "Job must be in progress" },
          { status: 400 },
        );
      }
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.COMPLETED,
          completedAt: new Date(),
          finalPrice: finalPrice ?? booking.quotedPrice ?? booking.estimatedPrice,
          ...(notes !== undefined && { notes }),
        },
        include: {
          service: true,
          serviceCategory: true,
          provider: true,
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      // Capture the held payment
      await capturePayment(id);

      // Notify customer that job is completed with review link
      sendJobCompletedEmail({
        bookingId: id,
        serviceType: updatedBooking.serviceCategory?.name ?? updatedBooking.serviceType,
        address: updatedBooking.address,
        city: updatedBooking.city,
        scheduledFor: updatedBooking.scheduledFor,
        estimatedPrice: updatedBooking.estimatedPrice,
        customerName: updatedBooking.customer.name || 'Customer',
        customerEmail: updatedBooking.customer.email,
        providerName: updatedBooking.provider?.name,
        providerEmail: updatedBooking.provider?.email,
        finalPrice: updatedBooking.finalPrice,
      });

      return NextResponse.json(updatedBooking);
    }

    // Legacy generic status update
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status: status as BookingStatus }),
        ...(finalPrice !== undefined && { finalPrice }),
        ...(notes !== undefined && { notes }),
        ...(status === BookingStatus.COMPLETED && { completedAt: new Date() }),
      },
      include: {
        service: true,
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
