'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Wrench, Zap, ChevronRight, ChevronLeft, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface ServiceCategory {
  id: string;
  serviceType: 'PLUMBING' | 'ELECTRICAL';
  name: string;
  description: string;
  basePrice: number;
  estimatedDuration: number;
}

interface BookingWizardProps {
  categories: ServiceCategory[];
  customer: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

type Step = 'service' | 'details' | 'confirm';

const URGENCY_OPTIONS = ['EMERGENCY', 'TODAY', 'SCHEDULED'] as const;
const URGENCY_MULTIPLIERS: Record<string, number> = {
  EMERGENCY: 1.5,
  TODAY: 1.2,
  SCHEDULED: 1.0,
};

export function BookingWizard({ categories, customer }: BookingWizardProps) {
  const router = useRouter();
  const t = useTranslations('BookWizard');
  const tc = useTranslations('Common');
  const [step, setStep] = useState<Step>('service');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Service selection
  const [serviceType, setServiceType] = useState<'PLUMBING' | 'ELECTRICAL' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  // Step 2: Details
  const [urgency, setUrgency] = useState<typeof URGENCY_OPTIONS[number]>('SCHEDULED');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [address, setAddress] = useState(customer.address);
  const [city, setCity] = useState(customer.city);
  const [state, setState] = useState(customer.state);
  const [zipCode, setZipCode] = useState(customer.zipCode);
  const [locationNotes, setLocationNotes] = useState('');

  const filteredCategories = categories.filter(
    (c) => c.serviceType === serviceType
  );

  const estimatedPrice = selectedCategory
    ? Math.round(selectedCategory.basePrice * URGENCY_MULTIPLIERS[urgency] * 100) / 100
    : 0;

  const today = new Date().toISOString().split('T')[0];

  const canProceedToDetails = selectedCategory !== null;
  const canProceedToConfirm =
    problemDescription.trim() &&
    address.trim() &&
    city.trim() &&
    state.trim() &&
    zipCode.trim() &&
    (urgency !== 'SCHEDULED' || (scheduledDate && scheduledTime));

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    setError(null);

    try {
      let scheduledFor: string;
      if (urgency === 'EMERGENCY') {
        scheduledFor = new Date().toISOString();
      } else if (urgency === 'TODAY') {
        const now = new Date();
        now.setHours(now.getHours() + 2);
        scheduledFor = now.toISOString();
      } else {
        scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: selectedCategory.serviceType,
          serviceCategoryId: selectedCategory.id,
          urgency,
          scheduledFor,
          address,
          city,
          state,
          zipCode,
          problemDescription,
          locationNotes: locationNotes || null,
          estimatedPrice,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('submitError'));
      }

      const booking = await response.json();
      router.push(`/bookings/${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submitError'));
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-center space-x-2">
        {(['service', 'details', 'confirm'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s
                  ? 'bg-navy text-white'
                  : ['service', 'details', 'confirm'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-fog text-storm'
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div
                className={`mx-2 h-0.5 w-8 ${
                  ['service', 'details', 'confirm'].indexOf(step) > i
                    ? 'bg-green-500'
                    : 'bg-fog'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Step 1: Service Selection */}
      {step === 'service' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-charcoal">{t('stepServiceTitle')}</h2>

          {/* Service type toggle */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setServiceType('PLUMBING');
                setSelectedCategory(null);
              }}
              className={`flex flex-col items-center rounded-lg border-2 p-6 transition-all ${
                serviceType === 'PLUMBING'
                  ? 'border-navy bg-navy/5'
                  : 'border-fog hover:border-storm'
              }`}
            >
              <Wrench className={`mb-2 h-8 w-8 ${serviceType === 'PLUMBING' ? 'text-navy' : 'text-storm'}`} />
              <span className={`font-medium ${serviceType === 'PLUMBING' ? 'text-navy' : 'text-charcoal'}`}>
                {tc('plumbing')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setServiceType('ELECTRICAL');
                setSelectedCategory(null);
              }}
              className={`flex flex-col items-center rounded-lg border-2 p-6 transition-all ${
                serviceType === 'ELECTRICAL'
                  ? 'border-navy bg-navy/5'
                  : 'border-fog hover:border-storm'
              }`}
            >
              <Zap className={`mb-2 h-8 w-8 ${serviceType === 'ELECTRICAL' ? 'text-navy' : 'text-storm'}`} />
              <span className={`font-medium ${serviceType === 'ELECTRICAL' ? 'text-navy' : 'text-charcoal'}`}>
                {tc('electrical')}
              </span>
            </button>
          </div>

          {/* Category selection */}
          {serviceType && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-slate">{t('whatDoYouNeed')}</h3>
              <div className="space-y-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      selectedCategory?.id === cat.id
                        ? 'border-navy bg-navy/5'
                        : 'border-fog hover:border-storm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-charcoal">{cat.name}</p>
                        <p className="text-sm text-slate">{cat.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-charcoal">${cat.basePrice}</p>
                        <p className="text-xs text-storm">{cat.estimatedDuration} {t('min')}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep('details')}
              disabled={!canProceedToDetails}
              className="inline-flex items-center rounded-md bg-navy px-6 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:bg-storm"
            >
              {t('next')} <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 'details' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-charcoal">{t('stepDetailsTitle')}</h2>

          {/* Urgency */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate">{t('urgencyLabel')}</label>
            <div className="grid grid-cols-3 gap-3">
              {URGENCY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setUrgency(opt)}
                  className={`flex flex-col items-center rounded-lg border-2 p-3 text-center transition-all ${
                    urgency === opt
                      ? 'border-navy bg-navy/5'
                      : 'border-fog hover:border-storm'
                  }`}
                >
                  {opt === 'EMERGENCY' && <AlertTriangle className={`mb-1 h-5 w-5 ${urgency === opt ? 'text-red-500' : 'text-storm'}`} />}
                  {opt === 'TODAY' && <Clock className={`mb-1 h-5 w-5 ${urgency === opt ? 'text-orange-500' : 'text-storm'}`} />}
                  {opt === 'SCHEDULED' && <Calendar className={`mb-1 h-5 w-5 ${urgency === opt ? 'text-navy' : 'text-storm'}`} />}
                  <span className="text-xs font-medium">{t(`urgency_${opt}`)}</span>
                  {opt !== 'SCHEDULED' && (
                    <span className="text-xs text-storm">{t(`urgencyMult_${opt}`)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date/Time only for SCHEDULED */}
          {urgency === 'SCHEDULED' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="scheduledDate" className="mb-1 block text-sm font-medium text-slate">
                  {t('preferredDate')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="scheduledDate"
                  min={today}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>
              <div>
                <label htmlFor="scheduledTime" className="mb-1 block text-sm font-medium text-slate">
                  {t('preferredTime')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="scheduledTime"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                  className="w-full rounded-md border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>
            </div>
          )}

          {/* Problem description */}
          <div>
            <label htmlFor="problemDescription" className="mb-1 block text-sm font-medium text-slate">
              {t('describeIssue')} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="problemDescription"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              required
              rows={4}
              className="w-full rounded-md border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              placeholder={t('issuePlaceholder')}
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate">
              {t('streetAddress')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full rounded-md border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              placeholder={t('addressPlaceholder')}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate">
                {tc('city')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full rounded-md border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label htmlFor="state" className="mb-1 block text-sm font-medium text-slate">
                {tc('state')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                maxLength={2}
                className="w-full rounded-md border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                placeholder="CA"
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="mb-1 block text-sm font-medium text-slate">
                {tc('zipCode')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
                maxLength={5}
                className="w-full rounded-md border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                placeholder="94102"
              />
            </div>
          </div>

          {/* Location notes */}
          <div>
            <label htmlFor="locationNotes" className="mb-1 block text-sm font-medium text-slate">
              {t('locationNotes')}
            </label>
            <input
              type="text"
              id="locationNotes"
              value={locationNotes}
              onChange={(e) => setLocationNotes(e.target.value)}
              className="w-full rounded-md border border-fog px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              placeholder={t('locationNotesPlaceholder')}
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep('service')}
              className="inline-flex items-center rounded-md border border-fog px-4 py-2 text-sm font-medium text-slate hover:bg-mist"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> {t('back')}
            </button>
            <button
              type="button"
              onClick={() => setStep('confirm')}
              disabled={!canProceedToConfirm}
              className="inline-flex items-center rounded-md bg-navy px-6 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:bg-storm"
            >
              {t('next')} <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 'confirm' && selectedCategory && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-charcoal">{t('stepConfirmTitle')}</h2>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="space-y-4">
              <div className="flex justify-between border-b border-fog pb-3">
                <span className="text-sm text-slate">{t('serviceLabel')}</span>
                <span className="font-medium text-charcoal">
                  {tc(selectedCategory.serviceType === 'PLUMBING' ? 'plumbing' : 'electrical')} — {selectedCategory.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-fog pb-3">
                <span className="text-sm text-slate">{t('urgencyLabel')}</span>
                <span className="font-medium text-charcoal">{t(`urgency_${urgency}`)}</span>
              </div>
              {urgency === 'SCHEDULED' && (
                <div className="flex justify-between border-b border-fog pb-3">
                  <span className="text-sm text-slate">{t('whenLabel')}</span>
                  <span className="font-medium text-charcoal">
                    {scheduledDate} {scheduledTime}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b border-fog pb-3">
                <span className="text-sm text-slate">{t('locationLabel')}</span>
                <span className="text-right font-medium text-charcoal">
                  {address}<br />
                  {city}, {state} {zipCode}
                </span>
              </div>
              <div className="border-b border-fog pb-3">
                <span className="text-sm text-slate">{t('problemLabel')}</span>
                <p className="mt-1 text-charcoal">{problemDescription}</p>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-lg font-semibold text-charcoal">{t('estimatedPrice')}</span>
                <span className="text-2xl font-bold text-navy">${estimatedPrice}</span>
              </div>
              <p className="text-xs text-storm">{t('priceNote')}</p>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">{t('matchingNote')}</p>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep('details')}
              className="inline-flex items-center rounded-md border border-fog px-4 py-2 text-sm font-medium text-slate hover:bg-mist"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> {t('back')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-md bg-navy px-8 py-2 text-sm font-semibold text-white hover:bg-navy-light disabled:bg-storm"
            >
              {isSubmitting ? t('submitting') : t('confirmBooking')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
