import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { ReviewClient } from "./review-client";

export const dynamic = 'force-dynamic';

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      provider: true,
    },
  });

  if (!booking) {
    redirect("/bookings");
  }

  if (booking.customerId !== session.user.id) {
    redirect("/bookings");
  }

  if (booking.status !== "COMPLETED") {
    redirect(`/bookings/${bookingId}`);
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: { bookingId },
  });

  if (existingReview) {
    redirect(`/bookings/${bookingId}`);
  }

  return <ReviewClient booking={booking} />;
}
