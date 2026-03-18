import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { EarningsClient } from "./earnings-client";

export const dynamic = 'force-dynamic';

export default async function EarningsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { serviceProvider: true },
  });

  if (!user?.serviceProvider) {
    redirect("/onboarding");
  }

  // Fetch completed bookings for earnings calculation
  const completedBookings = await prisma.booking.findMany({
    where: {
      providerId: user.serviceProvider.id,
      status: "COMPLETED",
    },
    include: {
      service: true,
      customer: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  return (
    <EarningsClient
      provider={user.serviceProvider}
      bookings={completedBookings}
    />
  );
}
