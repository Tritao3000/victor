import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ServiceType } from '@prisma/client';
import { ArrowLeft, Clock, DollarSign } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const dynamic = 'force-dynamic';

const SERVICE_TYPES = {
  plumbing: ServiceType.PLUMBING,
  electrical: ServiceType.ELECTRICAL,
} as const;

type ServiceTypeKey = keyof typeof SERVICE_TYPES;

interface PageProps {
  params: Promise<{
    type: ServiceTypeKey;
  }>;
}

export default async function ServicesPage({ params }: PageProps) {
  const { type } = await params;

  if (!SERVICE_TYPES[type]) {
    notFound();
  }

  const t = await getTranslations('Services');
  const tc = await getTranslations('Common');

  const serviceType = SERVICE_TYPES[type];
  const services = await prisma.service.findMany({
    where: {
      serviceType,
      isActive: true,
    },
    include: {
      provider: true,
    },
    orderBy: {
      category: 'asc',
    },
  });

  // Group services by category
  const servicesByCategory = services.reduce(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    },
    {} as Record<string, typeof services>,
  );

  const title = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <main className="min-h-screen bg-mist">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate hover:text-navy"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tc('backToHome')}
          </Link>
        </div>
      </header>

      {/* Page Title */}
      <section className="border-b bg-white py-8">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-charcoal">{t('title', { type: title })}</h1>
          <p className="mt-2 text-lg text-slate">
            {t('subtitle', { type })}
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="container mx-auto px-6 py-8">
        {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
          <div key={category} className="mb-12">
            <h2 className="mb-4 text-2xl font-bold text-charcoal">{category}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryServices.map((service) => (
                <div
                  key={service.id}
                  className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-semibold text-charcoal">
                      {service.name}
                    </h3>
                    <p className="mb-4 text-sm text-slate">{service.description}</p>

                    {/* Provider Info */}
                    <div className="mb-4 rounded-md bg-mist p-3">
                      <p className="text-sm font-medium text-charcoal">
                        {service.provider.name}
                      </p>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-slate">
                        <span>⭐ {service.provider.rating.toFixed(1)}</span>
                        <span>• {service.provider.totalReviews} {tc('reviews')}</span>
                      </div>
                    </div>

                    {/* Price and Duration */}
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <div className="flex items-center text-slate">
                        <DollarSign className="mr-1 h-4 w-4" />
                        <span>
                          ${service.basePrice} {service.priceUnit}
                        </span>
                      </div>
                      {service.estimatedDuration && (
                        <div className="flex items-center text-slate">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>~{service.estimatedDuration} {t('min')}</span>
                        </div>
                      )}
                    </div>

                    {/* Book Button */}
                    <Link
                      href={`/book/${service.id}`}
                      className="block w-full rounded-md bg-navy py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-light"
                    >
                      {tc('bookNow')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center">
            <p className="text-slate">
              {t('noServices', { type })}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export async function generateStaticParams() {
  return [{ type: 'plumbing' }, { type: 'electrical' }];
}
