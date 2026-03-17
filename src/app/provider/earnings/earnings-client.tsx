"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ServiceProvider, Booking, Service, User } from "@prisma/client";

type BookingWithRelations = Booking & {
  service: Service;
  customer: Pick<User, "name">;
};

type EarningsClientProps = {
  provider: ServiceProvider;
  bookings: BookingWithRelations[];
};

export function EarningsClient({ provider, bookings }: EarningsClientProps) {
  const earnings = useMemo(() => {
    const total = bookings.reduce(
      (sum, b) => sum + (b.finalPrice || b.quotedPrice),
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
      (sum, b) => sum + (b.finalPrice || b.quotedPrice),
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="mt-2 text-gray-600">
            Track your income and job history
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">This Month</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              ${earnings.monthlyTotal.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {earnings.monthlyJobCount} jobs
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">
              Total Earnings
            </div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              ${earnings.total.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">{earnings.jobCount} jobs</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">
              Average per Job
            </div>
            <div className="mt-2 text-3xl font-bold text-purple-600">
              $
              {earnings.jobCount > 0
                ? (earnings.total / earnings.jobCount).toFixed(2)
                : "0.00"}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">
              Completed Jobs
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {earnings.jobCount}
            </div>
          </Card>
        </div>

        {/* Job History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Job History
          </h2>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                No completed jobs yet. Start accepting bookings to build your
                history!
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => {
                    const completedDate = booking.completedAt
                      ? new Date(booking.completedAt)
                      : null;
                    return (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {completedDate
                            ? completedDate.toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.service.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.city}, {booking.state}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${(booking.finalPrice || booking.quotedPrice).toFixed(2)}
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
