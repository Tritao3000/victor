import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { AvailabilityClient } from "./availability-client";

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
