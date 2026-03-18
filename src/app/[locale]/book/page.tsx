import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { BookingWizard } from './booking-wizard';
import { getTranslations } from 'next-intl/server';

export default async function BookPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const t = await getTranslations('BookWizard');

  const customer = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!customer) {
    redirect('/login');
  }

  // Fetch all service categories for the wizard
  const categories = await prisma.serviceCategory.findMany({
    orderBy: [{ serviceType: 'asc' }, { name: 'asc' }],
  });

  return (
    <main className="min-h-screen bg-mist">
      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-3xl font-bold text-charcoal">{t('title')}</h1>
          <p className="mb-8 text-slate">{t('subtitle')}</p>
          <BookingWizard
            categories={JSON.parse(JSON.stringify(categories))}
            customer={{
              address: customer.address || '',
              city: customer.city || '',
              state: customer.state || '',
              zipCode: customer.zipCode || '',
            }}
          />
        </div>
      </div>
    </main>
  );
}
