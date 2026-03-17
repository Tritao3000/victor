"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/reviews/star-rating";
import { Booking, Service, ServiceProvider } from "@prisma/client";

type BookingWithRelations = Booking & {
  service: Service;
  provider: ServiceProvider;
};

type ReviewClientProps = {
  booking: BookingWithRelations;
};

export function ReviewClient({ booking }: ReviewClientProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      alert("Review submitted successfully!");
      router.push(`/bookings/${booking.id}`);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(
        error instanceof Error ? error.message : "Failed to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-mist py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">
            Rate Your Experience
          </h1>
          <p className="mt-2 text-slate">
            How was your service with {booking.provider.name}?
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              {booking.service.name}
            </h3>
            <p className="text-sm text-slate">
              Completed on{" "}
              {booking.completedAt
                ? new Date(booking.completedAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate mb-3">
                Your Rating
              </label>
              <div className="flex items-center gap-3">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="lg"
                />
                {rating > 0 && (
                  <span className="text-lg font-medium text-charcoal">
                    {rating} / 5
                  </span>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-slate mb-2"
              >
                Your Review (Optional)
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this service provider..."
                rows={5}
              />
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 bg-navy hover:bg-navy-light"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/bookings/${booking.id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
