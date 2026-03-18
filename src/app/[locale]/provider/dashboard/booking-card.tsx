"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Booking, Service, User } from "@prisma/client";

type BookingWithRelations = Booking & {
  service: Service | null;
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
  const t = useTranslations("BookingCard");
  const tc = useTranslations("Common");
  const tb = useTranslations("Bookings");
  const scheduledDate = new Date(booking.scheduledFor);
  const isRequested = booking.status === "REQUESTED";
  const isMatched = booking.status === "MATCHED";
  const isEnRoute = booking.status === "PROVIDER_EN_ROUTE";
  const isInProgress = booking.status === "IN_PROGRESS";
  const isCompleted = booking.status === "COMPLETED";
  const isCancelled = booking.status === "CANCELLED";

  const statusColors: Record<string, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-800",
    MATCHING: "bg-orange-100 text-orange-800",
    MATCHED: "bg-blue-100 text-blue-800",
    PROVIDER_EN_ROUTE: "bg-indigo-100 text-indigo-800",
    IN_PROGRESS: "bg-navy/10 text-navy",
    COMPLETED: "bg-mist text-charcoal",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-charcoal">
              {booking.service?.name ?? booking.serviceType}
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}
            >
              {booking.status.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-slate mb-2">
                {tc("customer")}
              </h4>
              <p className="text-sm text-slate">{booking.customer.name}</p>
              <p className="text-sm text-slate">{booking.customer.email}</p>
              <p className="text-sm text-slate">{booking.customer.phone}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate mb-2">
                {t("serviceDetails")}
              </h4>
              <p className="text-sm text-slate">
                <span className="font-medium">{t("when")}:</span>{" "}
                {scheduledDate.toLocaleDateString()} {tb("at")}{" "}
                {scheduledDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-slate">
                <span className="font-medium">{t("priceLabel")}:</span>{" "}
                {(booking.estimatedPrice ?? booking.quotedPrice ?? 0).toFixed(2)}€
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate mb-2">
              {t("location")}
            </h4>
            <p className="text-sm text-slate">
              {booking.address}, {booking.city}, {booking.state} {booking.zipCode}
            </p>
            {booking.locationNotes && (
              <p className="text-sm text-storm mt-1">
                {t("noteLabel")}: {booking.locationNotes}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate mb-2">
              {t("problemDescription")}
            </h4>
            <p className="text-sm text-slate">{booking.problemDescription}</p>
          </div>

          {booking.notes && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate mb-2">
                {t("notes")}
              </h4>
              <p className="text-sm text-slate">{booking.notes}</p>
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
              {t("acceptJob")}
            </Button>
            <Button
              onClick={() => onDecline(booking.id)}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              {t("decline")}
            </Button>
          </>
        )}
        {isMatched && (
          <Button
            onClick={() => onStatusChange(booking.id, "PROVIDER_EN_ROUTE")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            On My Way
          </Button>
        )}
        {isEnRoute && (
          <Button
            onClick={() => onStatusChange(booking.id, "IN_PROGRESS")}
            className="bg-navy hover:bg-navy-light"
          >
            {t("startJob")}
          </Button>
        )}
        {isInProgress && (
          <Button
            onClick={() => onStatusChange(booking.id, "COMPLETED")}
            className="bg-green-600 hover:bg-green-700"
          >
            {t("markCompleted")}
          </Button>
        )}
      </div>
    </Card>
  );
}
