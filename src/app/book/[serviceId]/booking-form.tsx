'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Service, ServiceProvider, User } from '@prisma/client';

interface BookingFormProps {
  service: Service & { provider: ServiceProvider };
  customer: User;
}

export function BookingForm({ service, customer }: BookingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    zipCode: customer.zipCode || '',
    problemDescription: '',
    locationNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Combine date and time into ISO string
      const scheduledFor = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          providerId: service.providerId,
          customerId: customer.id,
          scheduledFor: scheduledFor.toISOString(),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          problemDescription: formData.problemDescription,
          locationNotes: formData.locationNotes,
          quotedPrice: service.basePrice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      const booking = await response.json();
      router.push(`/bookings/${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Generate minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Booking Information</h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Date and Time */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="scheduledDate" className="mb-1 block text-sm font-medium text-gray-700">
            Preferred Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="scheduledDate"
            name="scheduledDate"
            min={today}
            value={formData.scheduledDate}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="scheduledTime" className="mb-1 block text-sm font-medium text-gray-700">
            Preferred Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="scheduledTime"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Address */}
      <div className="mb-4">
        <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="123 Main Street"
        />
      </div>

      {/* City, State, Zip */}
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="state" className="mb-1 block text-sm font-medium text-gray-700">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            maxLength={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="CA"
          />
        </div>
        <div>
          <label htmlFor="zipCode" className="mb-1 block text-sm font-medium text-gray-700">
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
            maxLength={5}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="94102"
          />
        </div>
      </div>

      {/* Problem Description */}
      <div className="mb-4">
        <label
          htmlFor="problemDescription"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Describe Your Issue <span className="text-red-500">*</span>
        </label>
        <textarea
          id="problemDescription"
          name="problemDescription"
          value={formData.problemDescription}
          onChange={handleChange}
          required
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Please describe the issue you're experiencing..."
        />
      </div>

      {/* Location Notes */}
      <div className="mb-6">
        <label htmlFor="locationNotes" className="mb-1 block text-sm font-medium text-gray-700">
          Location Notes (Optional)
        </label>
        <input
          type="text"
          id="locationNotes"
          name="locationNotes"
          value={formData.locationNotes}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g., Gate code, parking instructions"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
}
