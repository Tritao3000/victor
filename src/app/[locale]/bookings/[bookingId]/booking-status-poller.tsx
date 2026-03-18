'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { STATUS_LABELS } from '@/lib/constants';

interface BookingStatusPollerProps {
  bookingId: string;
  currentStatus: string;
}

export function BookingStatusPoller({ bookingId, currentStatus }: BookingStatusPollerProps) {
  const router = useRouter();
  const statusRef = useRef(currentStatus);

  useEffect(() => {
    statusRef.current = currentStatus;
  }, [currentStatus]);

  useEffect(() => {
    // Don't poll for terminal states
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) return;

        const booking = await res.json();
        if (booking.status !== statusRef.current) {
          const label = STATUS_LABELS[booking.status as keyof typeof STATUS_LABELS] || booking.status;
          toast.info(`Booking status updated: ${label}`);
          statusRef.current = booking.status;
          router.refresh();
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, [bookingId, currentStatus, router]);

  // This component renders nothing — it only polls
  return null;
}
