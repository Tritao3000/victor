import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = 'Victor <noreply@victor.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

type BookingEmailData = {
  bookingId: string;
  serviceType: string;
  address: string;
  city: string;
  scheduledFor: Date;
  estimatedPrice: number;
  customerName: string;
  customerEmail: string;
  providerName?: string;
  providerEmail?: string;
  estimatedArrival?: Date | null;
  finalPrice?: number | null;
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8f9fa">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:24px">
      <h1 style="color:#1a365d;font-size:24px;margin:0">Victor</h1>
    </div>
    <div style="background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;color:#94a3b8;font-size:12px">
      <p>Victor - Home Services Marketplace</p>
    </div>
  </div>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#1a365d;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;margin-top:16px">${text}</a>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set, skipping email:', subject);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('[email] Failed to send:', subject, error);
  }
}

// --- Email functions for each booking lifecycle event ---

export async function sendProviderMatchedEmail(data: BookingEmailData) {
  if (!data.providerEmail) return;

  const html = baseHtml(`
    <h2 style="color:#1a365d;margin:0 0 16px">New Booking Request</h2>
    <p style="color:#334155;margin:0 0 16px">You've been matched with a new ${data.serviceType.toLowerCase()} job.</p>
    <div style="background:#f1f5f9;border-radius:6px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 8px;color:#475569"><strong>Customer:</strong> ${data.customerName}</p>
      <p style="margin:0 0 8px;color:#475569"><strong>Service:</strong> ${data.serviceType}</p>
      <p style="margin:0 0 8px;color:#475569"><strong>Location:</strong> ${data.address}, ${data.city}</p>
      <p style="margin:0 0 8px;color:#475569"><strong>Scheduled:</strong> ${formatDate(data.scheduledFor)}</p>
      <p style="margin:0;color:#475569"><strong>Price:</strong> ${formatPrice(data.estimatedPrice)}</p>
    </div>
    <p style="color:#334155">Open your provider dashboard to accept or decline this job.</p>
    ${ctaButton('View Dashboard', `${APP_URL}/provider/dashboard`)}
  `);

  await sendEmail(data.providerEmail, `New booking request - ${data.serviceType}`, html);
}

export async function sendProviderAcceptedEmail(data: BookingEmailData) {
  const html = baseHtml(`
    <h2 style="color:#1a365d;margin:0 0 16px">Provider Confirmed</h2>
    <p style="color:#334155;margin:0 0 16px">Great news! <strong>${data.providerName}</strong> has accepted your booking.</p>
    <div style="background:#f1f5f9;border-radius:6px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 8px;color:#475569"><strong>Provider:</strong> ${data.providerName}</p>
      <p style="margin:0 0 8px;color:#475569"><strong>Service:</strong> ${data.serviceType}</p>
      <p style="margin:0 0 8px;color:#475569"><strong>Scheduled:</strong> ${formatDate(data.scheduledFor)}</p>
      <p style="margin:0;color:#475569"><strong>Price:</strong> ${formatPrice(data.estimatedPrice)}</p>
    </div>
    ${ctaButton('View Booking', `${APP_URL}/bookings/${data.bookingId}`)}
  `);

  await sendEmail(data.customerEmail, `Provider confirmed - ${data.providerName}`, html);
}

export async function sendProviderEnRouteEmail(data: BookingEmailData) {
  const etaText = data.estimatedArrival
    ? `Estimated arrival: ${formatDate(data.estimatedArrival)}`
    : 'They should arrive shortly.';

  const html = baseHtml(`
    <h2 style="color:#1a365d;margin:0 0 16px">Provider On The Way</h2>
    <p style="color:#334155;margin:0 0 16px"><strong>${data.providerName}</strong> is on their way to your location.</p>
    <div style="background:#f1f5f9;border-radius:6px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 8px;color:#475569"><strong>Provider:</strong> ${data.providerName}</p>
      <p style="margin:0;color:#475569"><strong>${etaText}</strong></p>
    </div>
    ${ctaButton('Track Booking', `${APP_URL}/bookings/${data.bookingId}`)}
  `);

  await sendEmail(data.customerEmail, `${data.providerName} is on the way`, html);
}

export async function sendJobCompletedEmail(data: BookingEmailData) {
  const price = data.finalPrice ?? data.estimatedPrice;

  const html = baseHtml(`
    <h2 style="color:#1a365d;margin:0 0 16px">Job Completed</h2>
    <p style="color:#334155;margin:0 0 16px">Your ${data.serviceType.toLowerCase()} job has been completed by <strong>${data.providerName}</strong>.</p>
    <div style="background:#f1f5f9;border-radius:6px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 8px;color:#475569"><strong>Service:</strong> ${data.serviceType}</p>
      <p style="margin:0 0 8px;color:#475569"><strong>Provider:</strong> ${data.providerName}</p>
      <p style="margin:0;color:#475569"><strong>Final Price:</strong> ${formatPrice(price)}</p>
    </div>
    <p style="color:#334155">Please take a moment to rate your experience.</p>
    ${ctaButton('Leave a Review', `${APP_URL}/bookings/${data.bookingId}/review`)}
  `);

  await sendEmail(data.customerEmail, `Job completed - Rate your experience`, html);
}

export async function sendBookingCancelledEmail(data: BookingEmailData) {
  const html = baseHtml(`
    <h2 style="color:#1a365d;margin:0 0 16px">Booking Cancelled</h2>
    <p style="color:#334155;margin:0 0 16px">Your ${data.serviceType.toLowerCase()} booking has been cancelled.</p>
    <div style="background:#f1f5f9;border-radius:6px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 8px;color:#475569"><strong>Service:</strong> ${data.serviceType}</p>
      <p style="margin:0 0 8px;color:#475569"><strong>Location:</strong> ${data.address}, ${data.city}</p>
      <p style="margin:0;color:#475569"><strong>Originally Scheduled:</strong> ${formatDate(data.scheduledFor)}</p>
    </div>
    <p style="color:#334155">If a payment hold was placed, it will be automatically released.</p>
    ${ctaButton('Book Again', `${APP_URL}/book`)}
  `);

  await sendEmail(data.customerEmail, `Booking cancelled`, html);
}
