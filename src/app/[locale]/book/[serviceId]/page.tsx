import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { BookingForm } from './booking-form';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{
    serviceId: string;
  }>;
}

export default async function BookServicePage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const { serviceId } = await params;

  const t = await getTranslations('BookService');

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: true,
    },
  });

  if (!service || !service.isActive) {
    notFound();
  }

  const customer = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!customer) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-mist">
      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 text-3xl font-bold text-charcoal">{t('title')}</h1>
          <p className="mb-8 text-slate">
            {t('fillForm', { serviceName: service.name })}
          </p>

          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-charcoal">{t('serviceDetails')}</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-slate">{t('serviceLabel')}</span>{' '}
                <span className="text-slate">{service.name}</span>
              </div>
              <div>
                <span className="font-medium text-slate">{t('providerLabel')}</span>{' '}
                <span className="text-slate">{service.provider.name}</span>
              </div>
              <div>
                <span className="font-medium text-slate">{t('basePriceLabel')}</span>{' '}
                <span className="text-slate">
                  ${service.basePrice} {service.priceUnit}
                </span>
              </div>
              {service.estimatedDuration && (
                <div>
                  <span className="font-medium text-slate">{t('durationLabel')}</span>{' '}
                  <span className="text-slate">{service.estimatedDuration} {t('minutes')}</span>
                </div>
              )}
              <div className="pt-2">
                <p className="text-slate">{service.description}</p>
              </div>
            </div>
          </div>

          <BookingForm service={service} customer={customer} />
        </div>
      </div>
    </main>
  );
}
