import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StarRating } from "@/components/reviews/star-rating";
import { ReviewList } from "@/components/reviews/review-list";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/format-price';

export const dynamic = 'force-dynamic';

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const t = await getTranslations('ProviderProfile');
  const tc = await getTranslations('Common');

  const provider = await prisma.serviceProvider.findUnique({
    where: { id },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!provider) {
    notFound();
  }

  // Fetch reviews
  const reviews = await prisma.review.findMany({
    where: {
      booking: {
        providerId: id,
      },
      isFlagged: false,
    },
    include: {
      customer: {
        select: {
          name: true,
          image: true,
        },
      },
      booking: {
        select: {
          service: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10, // Limit to 10 most recent reviews
  });

  return (
    <div className="min-h-screen bg-mist">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-start gap-6">
            {provider.image ? (
              <img
                src={provider.image}
                alt={provider.name}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-navy/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-navy">
                  {provider.name.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-charcoal mb-2">
                {provider.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(provider.rating)} readonly />
                  <span className="text-lg font-semibold text-charcoal">
                    {provider.rating.toFixed(1)}
                  </span>
                  <span className="text-slate">
                    ({provider.totalReviews} {tc('reviews')})
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    provider.verificationStatus === "VERIFIED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {provider.verificationStatus === "VERIFIED"
                    ? tc('verified')
                    : tc('pendingVerification')}
                </span>
              </div>

              {provider.bio && (
                <p className="text-slate mb-4">{provider.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-slate">
                <div>
                  <span className="font-medium">{t('serviceTypes')}</span>{" "}
                  {provider.serviceTypes.join(", ")}
                </div>
                {provider.specialties.length > 0 && (
                  <div>
                    <span className="font-medium">{t('specialties')}</span>{" "}
                    {provider.specialties.join(", ")}
                  </div>
                )}
                <div>
                  <span className="font-medium">{t('location')}</span> {provider.city}
                  , {provider.state}
                </div>
                <div>
                  <span className="font-medium">{t('serviceRadius')}</span>{" "}
                  {provider.serviceRadius} {t('miles')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        {provider.services.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-2xl font-bold text-charcoal mb-6">{t('servicesTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {provider.services.map((service) => (
                <Link
                  key={service.id}
                  href={`/book/${service.id}`}
                  className="p-4 border border-fog rounded-lg hover:border-navy hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-charcoal mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-slate mb-3">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-navy">
                      {formatPrice(service.basePrice)}
                    </span>
                    <span className="text-sm text-storm">
                      {service.priceUnit}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-charcoal mb-6">
            {t('customerReviews')}
          </h2>
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
