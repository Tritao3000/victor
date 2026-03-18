import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AvailabilityClient } from "./availability-client";

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("providerAvailabilityTitle"),
    description: t("providerAvailabilityDescription"),
  };
}

export default async function AvailabilityPage() {
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

  return <AvailabilityClient provider={user.serviceProvider} />;
}
