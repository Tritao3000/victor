import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookingForm } from './booking-form';

interface PageProps {
  params: Promise<{
    serviceId: string;
  }>;
}

export default async function BookServicePage({ params }: PageProps) {
  const { serviceId } = await params;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: true,
    },
  });

  if (!service || !service.isActive) {
    notFound();
  }

  // For now, we'll use a hardcoded customer ID from the seed data
  // In production, this would come from the authenticated session
  const customer = await prisma.user.findFirst({
    where: { email: 'customer@example.com' },
  });

  if (!customer) {
    // In production, redirect to login
    return <div>Please log in to book a service</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Book Service</h1>
          <p className="mb-8 text-gray-600">
            Fill out the form below to request {service.name}
          </p>

          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Service Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Service:</span>{' '}
                <span className="text-gray-600">{service.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Provider:</span>{' '}
                <span className="text-gray-600">{service.provider.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Base Price:</span>{' '}
                <span className="text-gray-600">
                  ${service.basePrice} {service.priceUnit}
                </span>
              </div>
              {service.estimatedDuration && (
                <div>
                  <span className="font-medium text-gray-700">Estimated Duration:</span>{' '}
                  <span className="text-gray-600">{service.estimatedDuration} minutes</span>
                </div>
              )}
              <div className="pt-2">
                <p className="text-gray-600">{service.description}</p>
              </div>
            </div>
          </div>

          <BookingForm service={service} customer={customer} />
        </div>
      </div>
    </main>
  );
}
