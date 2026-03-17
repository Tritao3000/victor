import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StarRating } from "@/components/reviews/star-rating";
import { ReviewList } from "@/components/reviews/review-list";

export const dynamic = 'force-dynamic';

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
    <div className="min-h-screen bg-gray-50">
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
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">
                  {provider.name.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {provider.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(provider.rating)} readonly />
                  <span className="text-lg font-semibold text-gray-900">
                    {provider.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-600">
                    ({provider.totalReviews} reviews)
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
                    ? "Verified"
                    : "Pending Verification"}
                </span>
              </div>

              {provider.bio && (
                <p className="text-gray-600 mb-4">{provider.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Service Types:</span>{" "}
                  {provider.serviceTypes.join(", ")}
                </div>
                {provider.specialties.length > 0 && (
                  <div>
                    <span className="font-medium">Specialties:</span>{" "}
                    {provider.specialties.join(", ")}
                  </div>
                )}
                <div>
                  <span className="font-medium">Location:</span> {provider.city}
                  , {provider.state}
                </div>
                <div>
                  <span className="font-medium">Service Radius:</span>{" "}
                  {provider.serviceRadius} miles
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        {provider.services.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {provider.services.map((service) => (
                <Link
                  key={service.id}
                  href={`/book/${service.id}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      ${service.basePrice}
                    </span>
                    <span className="text-sm text-gray-500">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews
          </h2>
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
