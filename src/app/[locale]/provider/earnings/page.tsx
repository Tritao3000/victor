import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { EarningsClient } from "./earnings-client";

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("providerEarningsTitle"),
    description: t("providerEarningsDescription"),
  };
}

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
