'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface BookingActionsProps {
  bookingId: string;
  canCancel: boolean;
  canReschedule: boolean;
}

export function BookingActions({
  bookingId,
  canCancel,
  canReschedule,
}: BookingActionsProps) {
  const router = useRouter();
  const t = useTranslations('BookingDetail');
  const tc = useTranslations('Common');
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
  });

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      router.refresh();
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast.error(t('cancelError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const scheduledFor = new Date(`${rescheduleData.date}T${rescheduleData.time}`);

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledFor: scheduledFor.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reschedule booking');
      }

      router.refresh();
      setShowReschedule(false);
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      toast.error(t('rescheduleError'));
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-charcoal">{t('actions')}</h2>

      <div className="space-y-3">
        {canReschedule && !showReschedule && (
          <button
            onClick={() => setShowReschedule(true)}
            className="w-full rounded-md border border-navy bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-navy/5"
          >
            {t('reschedule')}
          </button>
        )}

        {canCancel && !showCancelConfirm && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full rounded-md border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            {t('cancelBooking')}
          </button>
        )}
      </div>

      {/* Reschedule Form */}
      {showReschedule && (
        <form onSubmit={handleReschedule} className="mt-4 border-t pt-4">
          <h3 className="mb-3 font-medium text-charcoal">{t('selectNewDateTime')}</h3>
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="date" className="mb-1 block text-sm text-slate">
                {tc('date')}
              </label>
              <input
                type="date"
                id="date"
                min={today}
                value={rescheduleData.date}
                onChange={(e) =>
                  setRescheduleData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
                className="w-full rounded-md border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label htmlFor="time" className="mb-1 block text-sm text-slate">
                {tc('time')}
              </label>
              <input
                type="time"
                id="time"
                value={rescheduleData.time}
                onChange={(e) =>
                  setRescheduleData((prev) => ({ ...prev, time: e.target.value }))
                }
                required
                className="w-full rounded-md border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowReschedule(false)}
              disabled={isLoading}
              className="flex-1 rounded-md border border-fog px-4 py-2 text-sm font-medium text-slate hover:bg-mist disabled:bg-mist"
            >
              {t('cancelAction')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:bg-storm"
            >
              {isLoading ? t('updating') : t('confirmReschedule')}
            </button>
          </div>
        </form>
      )}

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="mt-4 border-t pt-4">
          <p className="mb-4 text-sm text-slate">
            {t('cancelConfirmation')}
          </p>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isLoading}
              className="flex-1 rounded-md border border-fog px-4 py-2 text-sm font-medium text-slate hover:bg-mist disabled:bg-mist"
            >
              {t('keepBooking')}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-storm"
            >
              {isLoading ? t('canceling') : t('yesCancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
