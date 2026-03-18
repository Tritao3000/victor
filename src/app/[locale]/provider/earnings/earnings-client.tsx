"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ServiceProvider, Booking, Service, User } from "@prisma/client";

type BookingWithRelations = Booking & {
  service: Service | null;
  customer: Pick<User, "name">;
};

type EarningsClientProps = {
  provider: ServiceProvider;
  bookings: BookingWithRelations[];
};

export function EarningsClient({ provider, bookings }: EarningsClientProps) {
  const t = useTranslations("Earnings");
  const tc = useTranslations("Common");
  const earnings = useMemo(() => {
    const total = bookings.reduce(
      (sum, b) => sum + (b.finalPrice || b.estimatedPrice || b.quotedPrice || 0),
      0,
    );

    const thisMonth = bookings.filter((b) => {
      const completedDate = b.completedAt ? new Date(b.completedAt) : null;
      if (!completedDate) return false;
      const now = new Date();
      return (
        completedDate.getMonth() === now.getMonth() &&
        completedDate.getFullYear() === now.getFullYear()
      );
    });

    const monthlyTotal = thisMonth.reduce(
      (sum, b) => sum + (b.finalPrice || b.estimatedPrice || b.quotedPrice || 0),
      0,
    );

    return {
      total,
      monthlyTotal,
      jobCount: bookings.length,
      monthlyJobCount: thisMonth.length,
    };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-mist">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">{t("title")}</h1>
          <p className="mt-2 text-slate">{t("description")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm font-medium text-slate">
              {t("thisMonth")}
            </div>
            <div className="mt-2 text-3xl font-bold text-success">
              ${earnings.monthlyTotal.toFixed(2)}
            </div>
            <div className="text-sm text-storm">
              {earnings.monthlyJobCount} {t("jobs")}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-medium text-slate">
              {t("totalEarnings")}
            </div>
            <div className="mt-2 text-3xl font-bold text-navy">
              ${earnings.total.toFixed(2)}
            </div>
            <div className="text-sm text-storm">
              {earnings.jobCount} {t("jobs")}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-medium text-slate">
              {t("averagePerJob")}
            </div>
            <div className="mt-2 text-3xl font-bold text-steel-blue">
              $
              {earnings.jobCount > 0
                ? (earnings.total / earnings.jobCount).toFixed(2)
                : "0.00"}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-medium text-slate">
              {t("completedJobs")}
            </div>
            <div className="mt-2 text-3xl font-bold text-charcoal">
              {earnings.jobCount}
            </div>
          </Card>
        </div>

        {/* Job History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-charcoal mb-6">
            {t("jobHistory")}
          </h2>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-storm">{t("noJobs")}</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-fog">
                <thead className="bg-mist">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-storm uppercase tracking-wider">
                      {t("tableDate")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-storm uppercase tracking-wider">
                      {t("tableCustomer")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-storm uppercase tracking-wider">
                      {t("tableService")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-storm uppercase tracking-wider">
                      {t("tableLocation")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-storm uppercase tracking-wider">
                      {t("tableAmount")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-fog">
                  {bookings.map((booking) => {
                    const completedDate = booking.completedAt
                      ? new Date(booking.completedAt)
                      : null;
                    return (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                          {completedDate
                            ? completedDate.toLocaleDateString()
                            : tc("na")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                          {booking.customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                          {booking.service?.name ?? booking.serviceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-storm">
                          {booking.city}, {booking.state}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success">
                          ${(booking.finalPrice || booking.estimatedPrice || booking.quotedPrice || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
