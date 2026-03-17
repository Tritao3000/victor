import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { prisma } from '@/lib/prisma';

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

export default async function BookingsPage() {
  // For now, we'll use a hardcoded customer ID from the seed data
  // In production, this would come from the authenticated session
  const customer = await prisma.user.findFirst({
    where: { email: 'customer@example.com' },
  });

  if (!customer) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to view your bookings.</p>
        </div>
      </main>
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      customerId: customer.id,
    },
    include: {
      service: true,
      provider: true,
    },
    orderBy: {
      scheduledFor: 'desc',
    },
  });

  const activeBookings = bookings.filter(
    (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED',
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'CANCELLED',
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">My Bookings</h1>

        {bookings.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="mb-4 text-gray-600">You haven't made any bookings yet.</p>
            <Link
              href="/"
              className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Browse Services
            </Link>
          </div>
        )}

        {/* Active Bookings */}
        {activeBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Active Bookings</h2>
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.service.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[booking.status]}`}
                        >
                          {STATUS_LABELS[booking.status]}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center text-sm text-gray-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {new Date(booking.scheduledFor).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(booking.scheduledFor).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center text-sm text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>
                          {booking.address}, {booking.city}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Provider: {booking.provider.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${booking.quotedPrice}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Past Bookings</h2>
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="block rounded-lg bg-white p-6 opacity-75 shadow transition-all hover:opacity-100 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.service.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[booking.status]}`}
                        >
                          {STATUS_LABELS[booking.status]}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center text-sm text-gray-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {new Date(booking.scheduledFor).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Provider: {booking.provider.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${booking.finalPrice || booking.quotedPrice}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
