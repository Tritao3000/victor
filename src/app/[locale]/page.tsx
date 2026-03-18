import type { Metadata } from 'next';
import { Wrench, Zap, CheckCircle, Shield, Clock, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/locale-switcher';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('landingTitle'),
    description: t('landingDescription'),
    openGraph: {
      title: t('landingTitle'),
      description: t('landingDescription'),
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Landing');
  const tc = await getTranslations('Common');
  return (
    <main className="min-h-screen bg-cloud">
      {/* Header */}
      <header className="border-b border-fog bg-white">
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy">
              <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none">
                <path d="M14 14L24 34L34 14" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-navy">Victor</h1>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/services" className="text-sm font-medium text-slate hover:text-navy transition-colors">
              {tc('services')}
            </Link>
            <a href="#how-it-works" className="text-sm font-medium text-slate hover:text-navy transition-colors">
              {tc('howItWorks')}
            </a>
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-fog bg-transparent font-medium text-navy hover:bg-mist hover:text-navy">
                {tc('signIn')}
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-navy font-medium text-white hover:bg-navy-light">
                {tc('getStarted')}
              </Button>
            </Link>
            <LocaleSwitcher />
          </nav>
          {/* Mobile: show sign-in and get started only */}
          <div className="flex items-center gap-3 md:hidden">
            <LocaleSwitcher />
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-fog bg-transparent font-medium text-navy hover:bg-mist hover:text-navy">
                {tc('signIn')}
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-navy font-medium text-white hover:bg-navy-light">
                {tc('getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-navy">
        <div className="container mx-auto px-6 py-20 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-amber">
              {t('heroTag')}
            </p>
            <h2 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t('heroTitle')}
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-white/70 sm:text-xl">
              {t('heroDescription')}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/book">
                <Button size="lg" className="w-full bg-amber px-8 font-medium text-navy hover:bg-amber-dark sm:w-auto">
                  {t('bookService')}
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="ghost" className="w-full border border-white/20 bg-transparent font-medium text-white hover:bg-white/10 hover:text-white sm:w-auto">
                  {t('learnMore')}
                </Button>
              </a>
            </div>

            {/* Hero stats */}
            <div className="mt-16 grid grid-cols-3 gap-4 border-t border-white/10 pt-10">
              <div>
                <p className="text-2xl font-bold text-white sm:text-3xl">500+</p>
                <p className="mt-1 text-xs text-white/50 sm:text-sm">{t('verifiedPros')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white sm:text-3xl">4.9</p>
                <p className="mt-1 text-xs text-white/50 sm:text-sm">{t('averageRating')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white sm:text-3xl">2hr</p>
                <p className="mt-1 text-xs text-white/50 sm:text-sm">{t('avgResponse')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b border-fog bg-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm font-medium text-slate">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-amber" />
              <span>{t('verifiedProfessionals')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber" />
              <span>{t('licensedInsured')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber" />
              <span>{t('sameDayService')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h3 className="mb-3 text-3xl font-bold tracking-tight text-charcoal">
            {t('ourServices')}
          </h3>
          <p className="text-lg text-slate">
            {t('expertHelp')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Plumbing Card */}
          <Link
            href="/services/plumbing"
            className="group rounded-xl border border-fog bg-white p-8 transition-all hover:border-navy/20 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 transition-colors group-hover:bg-navy/10">
              <Wrench className="h-6 w-6 text-navy" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-charcoal">{tc('plumbing')}</h3>
            <p className="mb-6 text-slate">
              {t('plumbingDescription')}
            </p>
            <ul className="mb-6 space-y-2.5 text-sm text-slate">
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                {t('emergencyLeak')}
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                {t('drainCleaning')}
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                {t('waterHeater')}
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                {t('pipeRepair')}
              </li>
            </ul>
            <div className="flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-amber transition-colors">
              {t('viewPlumbing')}
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Electrical Card */}
          <Link
            href="/services/electrical"
            className="group rounded-xl border border-fog bg-white p-8 transition-all hover:border-navy/20 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 transition-colors group-hover:bg-navy/10">
              <Zap className="h-6 w-6 text-navy" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-charcoal">{tc('electrical')}</h3>
            <p className="mb-6 text-slate">
              {t('electricalDescription')}
            </p>
            <ul className="mb-6 space-y-2.5 text-sm text-slate">
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                {t('outletInstall')}
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                {t('circuitBreaker')}
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                {t('lightingInstall')}
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                {t('panelUpgrade')}
              </li>
            </ul>
            <div className="flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-amber transition-colors">
              {t('viewElectrical')}
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-fog bg-mist py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h3 className="mb-3 text-3xl font-bold tracking-tight text-charcoal">
              {t('howItWorksTitle')}
            </h3>
            <p className="text-lg text-slate">
              {t('threeSteps')}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl font-semibold text-white">
                1
              </div>
              <h4 className="mb-3 text-xl font-semibold text-charcoal">{t('step1Title')}</h4>
              <p className="text-slate">
                {t('step1Desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl font-semibold text-white">
                2
              </div>
              <h4 className="mb-3 text-xl font-semibold text-charcoal">{t('step2Title')}</h4>
              <p className="text-slate">
                {t('step2Desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl font-semibold text-white">
                3
              </div>
              <h4 className="mb-3 text-xl font-semibold text-charcoal">{t('step3Title')}</h4>
              <p className="text-slate">
                {t('step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h3 className="mb-3 text-3xl font-bold tracking-tight text-charcoal">
            {t('testimonials')}
          </h3>
          <p className="text-lg text-slate">
            {t('realReviews')}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: t('testimonial1Name'),
              text: t('testimonial1Text'),
              rating: 5,
              service: t('testimonial1Service'),
            },
            {
              name: t('testimonial2Name'),
              text: t('testimonial2Text'),
              rating: 5,
              service: t('testimonial2Service'),
            },
            {
              name: t('testimonial3Name'),
              text: t('testimonial3Text'),
              rating: 5,
              service: t('testimonial3Service'),
            },
          ].map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl border border-fog bg-white p-6"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber text-amber" />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div>
                <p className="text-sm font-medium text-charcoal">{testimonial.name}</p>
                <p className="text-xs text-storm">{testimonial.service}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-navy px-8 py-16 text-center">
          <h3 className="mb-4 text-3xl font-bold text-white">
            {t('ctaTitle')}
          </h3>
          <p className="mb-8 text-lg text-white/60">
            {t('ctaDescription')}
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-amber px-8 font-medium text-navy hover:bg-amber-dark">
              {t('ctaButton')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-fog bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy">
                <svg viewBox="0 0 48 48" className="h-4 w-4" fill="none">
                  <path d="M14 14L24 34L34 14" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-bold text-navy">Victor</span>
            </div>
            <div className="flex gap-6 text-sm text-storm">
              <Link href="/services" className="hover:text-navy transition-colors">{tc('services')}</Link>
              <a href="#how-it-works" className="hover:text-navy transition-colors">{tc('howItWorks')}</a>
            </div>
            <p className="text-sm text-storm">
              {t('copyright')}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
