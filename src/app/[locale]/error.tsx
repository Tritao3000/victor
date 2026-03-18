'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-6">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-charcoal">{t('title')}</h1>
        <p className="mb-6 text-slate">{t('description')}</p>
        <Button onClick={reset}>{t('tryAgain')}</Button>
      </div>
    </main>
  );
}
