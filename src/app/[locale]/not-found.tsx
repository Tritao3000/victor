import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-6">
      <div className="text-center">
        <div className="mb-6 text-6xl font-bold text-navy">404</div>
        <h1 className="mb-2 text-2xl font-bold text-charcoal">
          {t('title')}
        </h1>
        <p className="mb-8 text-slate">{t('description')}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-light"
        >
          {t('backToHome')}
        </Link>
      </div>
    </main>
  );
}
