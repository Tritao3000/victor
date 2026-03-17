import Link from 'next/link';
import { Wrench, Zap, CheckCircle, Shield, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
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
          <nav className="flex items-center gap-6">
            <Link href="/services" className="text-sm font-medium text-slate hover:text-navy transition-colors">
              Services
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-slate hover:text-navy transition-colors">
              How it works
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-fog font-medium text-navy hover:bg-mist">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-navy font-medium text-white hover:bg-navy-light">
                Get started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section -- Dark navy background */}
      <section className="bg-navy">
        <div className="container mx-auto px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white lg:text-6xl">
              Professional home services, delivered fast
            </h2>
            <p className="mb-10 text-xl leading-relaxed text-white/70">
              Connect with verified plumbing and electrical professionals. Book in minutes, get it fixed today.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/book">
                <Button size="lg" className="bg-amber px-8 font-medium text-navy hover:bg-amber-dark">
                  Book a service
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="border-white/20 font-medium text-white hover:bg-white/10">
                  Learn more
                </Button>
              </Link>
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
              <span>Verified professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber" />
              <span>Licensed & insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber" />
              <span>Same-day service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h3 className="mb-3 text-3xl font-bold tracking-tight text-charcoal">
            Our services
          </h3>
          <p className="text-lg text-slate">
            Expert help for your home, when you need it
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
            <h3 className="mb-2 text-2xl font-semibold text-charcoal">Plumbing</h3>
            <p className="mb-6 text-slate">
              Emergency repairs, installations, and maintenance for all your plumbing needs
            </p>
            <ul className="mb-6 space-y-2.5 text-sm text-slate">
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                Emergency leak repair
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                Drain cleaning & unclogging
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                Water heater installation & repair
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                Pipe repair & installation
              </li>
            </ul>
            <div className="flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-amber transition-colors">
              View plumbing services
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
            <h3 className="mb-2 text-2xl font-semibold text-charcoal">Electrical</h3>
            <p className="mb-6 text-slate">
              Safe, certified electrical work for outlets, panels, lighting, and more
            </p>
            <ul className="mb-6 space-y-2.5 text-sm text-slate">
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                Outlet installation & repair
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                Circuit breaker replacement
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                Lighting installation
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber"></span>
                Electrical panel upgrades
              </li>
            </ul>
            <div className="flex items-center gap-1.5 text-sm font-medium text-navy group-hover:text-amber transition-colors">
              View electrical services
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-fog bg-mist py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h3 className="mb-3 text-3xl font-bold tracking-tight text-charcoal">
              How it works
            </h3>
            <p className="text-lg text-slate">
              Get help in three simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl font-semibold text-white">
                1
              </div>
              <h4 className="mb-3 text-xl font-semibold text-charcoal">Choose your service</h4>
              <p className="text-slate">
                Select from plumbing or electrical services that match your needs
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl font-semibold text-white">
                2
              </div>
              <h4 className="mb-3 text-xl font-semibold text-charcoal">Book your time</h4>
              <p className="text-slate">
                Pick a time slot that works for you and describe your issue
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl font-semibold text-white">
                3
              </div>
              <h4 className="mb-3 text-xl font-semibold text-charcoal">Get it fixed</h4>
              <p className="text-slate">
                A verified professional arrives on time and completes the job
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="rounded-2xl bg-navy px-8 py-16 text-center">
          <h3 className="mb-4 text-3xl font-bold text-white">
            Ready to get started?
          </h3>
          <p className="mb-8 text-lg text-white/60">
            Book a professional today and get your home services handled fast
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-amber px-8 font-medium text-navy hover:bg-amber-dark">
              Book now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-fog bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy">
                <svg viewBox="0 0 48 48" className="h-4 w-4" fill="none">
                  <path d="M14 14L24 34L34 14" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-bold text-navy">Victor</span>
            </div>
            <p className="text-sm text-storm">
              &copy; 2026 Victor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
