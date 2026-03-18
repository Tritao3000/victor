import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProviderNav } from "./provider-nav";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Only allow service providers to access provider routes
  if ((session.user as any).role !== "SERVICE_PROVIDER") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-mist">
      <ProviderNav />
      {children}
    </div>
  );
}
