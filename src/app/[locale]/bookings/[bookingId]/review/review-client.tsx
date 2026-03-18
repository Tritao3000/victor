"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/reviews/star-rating";
import { Booking, Service, ServiceProvider } from "@prisma/client";
import { useTranslations } from "next-intl";

type BookingWithRelations = Booking & {
  service: Service | null;
  provider: ServiceProvider | null;
};

type ReviewClientProps = {
  booking: BookingWithRelations;
};

export function ReviewClient({ booking }: ReviewClientProps) {
  const router = useRouter();
  const t = useTranslations('Review');
  const tc = useTranslations('Common');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      alert(t('ratingRequired'));
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
        throw new Error(data.error || t('submitError'));
      }

      alert(t('submitSuccess'));
      router.push(`/bookings/${booking.id}`);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(
        error instanceof Error ? error.message : t('submitError'),
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
            {t('rateExperience')}
          </h1>
          <p className="mt-2 text-slate">
            {t('howWasService', { providerName: booking.provider?.name ?? 'your provider' })}
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              {booking.service?.name ?? booking.serviceType}
            </h3>
            <p className="text-sm text-slate">
              {t('completedOn', {
                date: booking.completedAt
                  ? new Date(booking.completedAt).toLocaleDateString()
                  : tc('na')
              })}
            </p>
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate mb-3">
                {t('yourRating')}
              </label>
              <div className="flex items-center gap-3">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="lg"
                />
                {rating > 0 && (
                  <span className="text-lg font-medium text-charcoal">
                    {t('ratingDisplay', { rating })}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-slate mb-2"
              >
                {t('reviewLabel')}
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('reviewPlaceholder')}
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
              {submitting ? t('submitting') : t('submitReview')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/bookings/${booking.id}`)}
            >
              {tc('cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
