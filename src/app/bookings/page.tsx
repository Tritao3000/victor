import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const bookings = await prisma.booking.findMany({
    where: {
      customerId: session.user.id,
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
    <main className="min-h-screen bg-mist">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate hover:text-navy"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold text-charcoal">My Bookings</h1>

        {bookings.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <p className="mb-4 text-slate">You haven't made any bookings yet.</p>
            <Link
              href="/"
              className="inline-block rounded-md bg-navy px-6 py-2 text-sm font-semibold text-white hover:bg-navy-light"
            >
              Browse Services
            </Link>
          </div>
        )}

        {/* Active Bookings */}
        {activeBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-charcoal">Active Bookings</h2>
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
                        <h3 className="text-lg font-semibold text-charcoal">
                          {booking.service.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[booking.status]}`}
                        >
                          {STATUS_LABELS[booking.status]}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center text-sm text-slate">
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
                      <div className="mb-2 flex items-center text-sm text-slate">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>
                          {booking.address}, {booking.city}
                        </span>
                      </div>
                      <p className="text-sm text-slate">
                        Provider: {booking.provider.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-charcoal">
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
            <h2 className="mb-4 text-xl font-semibold text-charcoal">Past Bookings</h2>
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
                        <h3 className="text-lg font-semibold text-charcoal">
                          {booking.service.name}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[booking.status]}`}
                        >
                          {STATUS_LABELS[booking.status]}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center text-sm text-slate">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          {new Date(booking.scheduledFor).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate">
                        Provider: {booking.provider.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-charcoal">
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
