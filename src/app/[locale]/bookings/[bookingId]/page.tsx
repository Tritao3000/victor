import { notFound, redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { BookingActions } from './booking-actions';
import { ArrowLeft, Calendar, Clock, MapPin, FileText, DollarSign } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';
import { getTranslations, getLocale } from 'next-intl/server';

interface PageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      provider: true,
      customer: true,
      review: true,
    },
  });

  if (!booking) {
    notFound();
  }

  // Verify the user is either the customer or the provider for this booking
  if (booking.customerId !== session.user.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { serviceProvider: true },
    });
    if (!user?.serviceProvider || user.serviceProvider.id !== booking.providerId) {
      notFound();
    }
  }

  const t = await getTranslations('BookingDetail');
  const tc = await getTranslations('Common');
  const locale = await getLocale();

  const scheduledDate = new Date(booking.scheduledFor);
  const canCancel = booking.status === 'REQUESTED' || booking.status === 'MATCHING';
  const canReschedule = booking.status === 'REQUESTED' || booking.status === 'MATCHING';

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/bookings"
            className="inline-flex items-center text-sm text-slate hover:text-navy"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToBookings')}
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-charcoal">
                {booking.service?.name ?? booking.serviceType}
              </h1>
              <p className="text-slate">{t('bookingId')}{booking.id.slice(0, 8)}</p>
            </div>
            <span
              className={`rounded-full px-4 py-1 text-sm font-medium ${STATUS_COLORS[booking.status]}`}
            >
              {STATUS_LABELS[booking.status]}
            </span>
          </div>

          {/* Provider Info */}
          {booking.provider && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-charcoal">{t('serviceProvider')}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10 text-lg font-bold text-navy">
                {booking.provider.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-charcoal">{booking.provider.name}</p>
                <p className="text-sm text-slate">{booking.provider.phone}</p>
                <div className="mt-1 flex items-center space-x-2 text-xs text-storm">
                  <span>⭐ {booking.provider.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{booking.provider.totalReviews} {tc('reviews')}</span>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Booking Details */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-charcoal">{t('bookingDetails')}</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="mr-3 mt-0.5 h-5 w-5 text-storm" />
                <div>
                  <p className="text-sm font-medium text-slate">{t('scheduledDateTime')}</p>
                  <p className="text-charcoal">
                    {scheduledDate.toLocaleDateString(locale, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-slate">
                    {scheduledDate.toLocaleTimeString(locale, {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="mr-3 mt-0.5 h-5 w-5 text-storm" />
                <div>
                  <p className="text-sm font-medium text-slate">{t('serviceLocation')}</p>
                  <p className="text-charcoal">{booking.address}</p>
                  <p className="text-slate">
                    {booking.city}, {booking.state} {booking.zipCode}
                  </p>
                  {booking.locationNotes && (
                    <p className="mt-1 text-sm text-storm">
                      {t('noteLabel')}{booking.locationNotes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <FileText className="mr-3 mt-0.5 h-5 w-5 text-storm" />
                <div>
                  <p className="text-sm font-medium text-slate">{t('problemDescription')}</p>
                  <p className="text-charcoal">{booking.problemDescription}</p>
                </div>
              </div>

              <div className="flex items-start">
                <DollarSign className="mr-3 mt-0.5 h-5 w-5 text-storm" />
                <div>
                  <p className="text-sm font-medium text-slate">{t('price')}</p>
                  <p className="text-charcoal">
                    ${booking.finalPrice || booking.estimatedPrice || booking.quotedPrice || 0}
                    {booking.finalPrice && booking.quotedPrice && booking.finalPrice !== booking.quotedPrice && (
                      <span className="ml-2 text-sm text-storm">
                        ({t('quoted')} ${booking.quotedPrice})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {(canCancel || canReschedule) && (
            <BookingActions
              bookingId={booking.id}
              canCancel={canCancel}
              canReschedule={canReschedule}
            />
          )}

          {/* Provider Notes */}
          {booking.notes && (
            <div className="mb-6 rounded-lg bg-blue-50 p-6">
              <h3 className="mb-2 font-semibold text-blue-900">{t('providerNotes')}</h3>
              <p className="text-blue-800">{booking.notes}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
