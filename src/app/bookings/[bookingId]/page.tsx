import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BookingActions } from './booking-actions';
import { ArrowLeft, Calendar, Clock, MapPin, FileText, DollarSign } from 'lucide-react';

interface PageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

const STATUS_COLORS = {
  REQUESTED: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  REQUESTED: 'Requested',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default async function BookingDetailPage({ params }: PageProps) {
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

  const scheduledDate = new Date(booking.scheduledFor);
  const canCancel = booking.status === 'REQUESTED' || booking.status === 'CONFIRMED';
  const canReschedule = booking.status === 'REQUESTED' || booking.status === 'CONFIRMED';

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/bookings"
            className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to bookings
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {booking.service.name}
              </h1>
              <p className="text-gray-600">Booking ID: {booking.id.slice(0, 8)}</p>
            </div>
            <span
              className={`rounded-full px-4 py-1 text-sm font-medium ${STATUS_COLORS[booking.status]}`}
            >
              {STATUS_LABELS[booking.status]}
            </span>
          </div>

          {/* Provider Info */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Service Provider</h2>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                {booking.provider.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{booking.provider.name}</p>
                <p className="text-sm text-gray-600">{booking.provider.phone}</p>
                <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                  <span>⭐ {booking.provider.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{booking.provider.totalReviews} reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Booking Details</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="mr-3 mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Scheduled Date & Time</p>
                  <p className="text-gray-900">
                    {scheduledDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-gray-600">
                    {scheduledDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="mr-3 mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Service Location</p>
                  <p className="text-gray-900">{booking.address}</p>
                  <p className="text-gray-600">
                    {booking.city}, {booking.state} {booking.zipCode}
                  </p>
                  {booking.locationNotes && (
                    <p className="mt-1 text-sm text-gray-500">
                      Note: {booking.locationNotes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <FileText className="mr-3 mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Problem Description</p>
                  <p className="text-gray-900">{booking.problemDescription}</p>
                </div>
              </div>

              <div className="flex items-start">
                <DollarSign className="mr-3 mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Price</p>
                  <p className="text-gray-900">
                    ${booking.finalPrice || booking.quotedPrice}
                    {booking.finalPrice && booking.finalPrice !== booking.quotedPrice && (
                      <span className="ml-2 text-sm text-gray-500">
                        (quoted: ${booking.quotedPrice})
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
              <h3 className="mb-2 font-semibold text-blue-900">Provider Notes</h3>
              <p className="text-blue-800">{booking.notes}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
