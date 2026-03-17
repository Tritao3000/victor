"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function ProviderNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/provider/dashboard", label: "Dashboard" },
    { href: "/provider/availability", label: "Availability" },
    { href: "/provider/earnings", label: "Earnings" },
    { href: "/provider/profile", label: "Profile" },
  ];

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/provider/dashboard" className="text-2xl font-bold text-blue-600">
                Victor
              </Link>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                Provider
              </span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${
                      isActive
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  isActive
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
