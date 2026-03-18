"use client";

import { Card } from "@/components/ui/card";
import { useTranslations } from 'next-intl';

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  customer: {
    name: string | null;
    image: string | null;
  };
  booking: {
    service: {
      name: string;
    } | null;
  };
};

type ReviewListProps = {
  reviews: Review[];
};

export function ReviewList({ reviews }: ReviewListProps) {
  const t = useTranslations('ProviderProfile');
  const tc = useTranslations('Common');

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-storm">{t('noReviews')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-6">
          <div className="flex items-start gap-4">
            {review.customer.image ? (
              <img
                src={review.customer.image}
                alt={review.customer.name || tc('customer')}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-fog flex items-center justify-center">
                <span className="text-slate font-medium">
                  {review.customer.name?.charAt(0) || "?"}
                </span>
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-charcoal">
                    {review.customer.name || tc('anonymous')}
                  </p>
                  <p className="text-sm text-storm">
                    {review.booking.service?.name ?? 'Service'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= review.rating
                            ? "text-amber fill-current"
                            : "text-fog"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-storm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {review.comment && (
                <p className="text-slate mt-2">{review.comment}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
