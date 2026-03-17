'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      alert('Failed to cancel booking. Please try again.');
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
      alert('Failed to reschedule booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Actions</h2>

      <div className="space-y-3">
        {canReschedule && !showReschedule && (
          <button
            onClick={() => setShowReschedule(true)}
            className="w-full rounded-md border border-indigo-600 bg-white px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            Reschedule Appointment
          </button>
        )}

        {canCancel && !showCancelConfirm && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full rounded-md border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Cancel Booking
          </button>
        )}
      </div>

      {/* Reschedule Form */}
      {showReschedule && (
        <form onSubmit={handleReschedule} className="mt-4 border-t pt-4">
          <h3 className="mb-3 font-medium text-gray-900">Select New Date & Time</h3>
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="date" className="mb-1 block text-sm text-gray-700">
                Date
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="time" className="mb-1 block text-sm text-gray-700">
                Time
              </label>
              <input
                type="time"
                id="time"
                value={rescheduleData.time}
                onChange={(e) =>
                  setRescheduleData((prev) => ({ ...prev, time: e.target.value }))
                }
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowReschedule(false)}
              disabled={isLoading}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Updating...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      )}

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="mt-4 border-t pt-4">
          <p className="mb-4 text-sm text-gray-700">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isLoading}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Canceling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
