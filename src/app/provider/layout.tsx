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

  return (
    <div className="min-h-screen bg-gray-50">
      <ProviderNav />
      {children}
    </div>
  );
}
