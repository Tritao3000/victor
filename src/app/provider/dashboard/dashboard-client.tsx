"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingCard } from "./booking-card";
import { ServiceProvider, Booking, Service, User } from "@prisma/client";

type BookingWithRelations = Booking & {
  service: Service;
  customer: Pick<User, "id" | "name" | "email" | "phone">;
};

type DashboardClientProps = {
  provider: ServiceProvider;
};

export function DashboardClient({ provider }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "active" | "history">(
    "requests",
  );
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  async function fetchBookings() {
    setLoading(true);
    try {
      let status = "";
      if (activeTab === "requests") status = "REQUESTED";
      if (activeTab === "active") status = "CONFIRMED,IN_PROGRESS";
      if (activeTab === "history") status = "COMPLETED,CANCELLED";

      const response = await fetch(
        `/api/provider/bookings${status ? `?status=${status}` : ""}`,
      );
      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(bookingId: string) {
    try {
      const response = await fetch(`/api/provider/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });

      if (!response.ok) throw new Error("Failed to accept booking");

      await fetchBookings();
    } catch (error) {
      console.error("Error accepting booking:", error);
      alert("Failed to accept booking");
    }
  }

  async function handleDecline(bookingId: string) {
    try {
      const response = await fetch(`/api/provider/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!response.ok) throw new Error("Failed to decline booking");

      await fetchBookings();
    } catch (error) {
      console.error("Error declining booking:", error);
      alert("Failed to decline booking");
    }
  }

  async function handleStatusChange(bookingId: string, status: string) {
    try {
      const response = await fetch(`/api/provider/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update booking");

      await fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking status");
    }
  }

  const requestCount = bookings.filter((b) => b.status === "REQUESTED").length;
  const activeCount = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "IN_PROGRESS",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {provider.name}
          </h1>
          <p className="mt-2 text-gray-600">
            {provider.isActive
              ? "You're currently accepting new jobs"
              : "Your profile is inactive"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">
              Pending Requests
            </div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {requestCount}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Active Jobs</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {activeCount}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">
              Average Rating
            </div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">
              {provider.rating > 0 ? provider.rating.toFixed(1) : "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {provider.totalReviews} reviews
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("requests")}
              className={`${
                activeTab === "requests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Booking Requests
              {requestCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {requestCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`${
                activeTab === "active"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Active Jobs
              {activeCount > 0 && (
                <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {activeCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              History
            </button>
          </nav>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading bookings...</div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {activeTab === "requests" && "No pending booking requests"}
                {activeTab === "active" && "No active jobs"}
                {activeTab === "history" && "No booking history"}
              </div>
            </div>
          ) : (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
