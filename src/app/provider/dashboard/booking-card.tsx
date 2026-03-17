"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking, Service, User } from "@prisma/client";

type BookingWithRelations = Booking & {
  service: Service;
  customer: Pick<User, "id" | "name" | "email" | "phone">;
};

type BookingCardProps = {
  booking: BookingWithRelations;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
};

export function BookingCard({
  booking,
  onAccept,
  onDecline,
  onStatusChange,
}: BookingCardProps) {
  const scheduledDate = new Date(booking.scheduledFor);
  const isRequested = booking.status === "REQUESTED";
  const isConfirmed = booking.status === "CONFIRMED";
  const isInProgress = booking.status === "IN_PROGRESS";
  const isCompleted = booking.status === "COMPLETED";
  const isCancelled = booking.status === "CANCELLED";

  const statusColors = {
    REQUESTED: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.service.name}
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}
            >
              {booking.status.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Customer
              </h4>
              <p className="text-sm text-gray-600">{booking.customer.name}</p>
              <p className="text-sm text-gray-600">{booking.customer.email}</p>
              <p className="text-sm text-gray-600">{booking.customer.phone}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Service Details
              </h4>
              <p className="text-sm text-gray-600">
                <span className="font-medium">When:</span>{" "}
                {scheduledDate.toLocaleDateString()} at{" "}
                {scheduledDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Price:</span> $
                {booking.quotedPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
            <p className="text-sm text-gray-600">
              {booking.address}, {booking.city}, {booking.state} {booking.zipCode}
            </p>
            {booking.locationNotes && (
              <p className="text-sm text-gray-500 mt-1">
                Note: {booking.locationNotes}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Problem Description
            </h4>
            <p className="text-sm text-gray-600">{booking.problemDescription}</p>
          </div>

          {booking.notes && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{booking.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {isRequested && (
          <>
            <Button
              onClick={() => onAccept(booking.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept Job
            </Button>
            <Button
              onClick={() => onDecline(booking.id)}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Decline
            </Button>
          </>
        )}
        {isConfirmed && (
          <Button
            onClick={() => onStatusChange(booking.id, "IN_PROGRESS")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start Job
          </Button>
        )}
        {isInProgress && (
          <Button
            onClick={() => onStatusChange(booking.id, "COMPLETED")}
            className="bg-green-600 hover:bg-green-700"
          >
            Mark as Completed
          </Button>
        )}
      </div>
    </Card>
  );
}
