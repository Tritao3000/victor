import Link from 'next/link';
import { Wrench, Zap, CheckCircle, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
              <span className="text-lg font-bold text-white">V</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Victor</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/services" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Services
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              How it works
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="font-medium">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-gray-900 font-medium hover:bg-gray-800">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 lg:text-6xl">
            Professional home services, delivered fast
          </h2>
          <p className="mb-10 text-xl leading-relaxed text-gray-600">
            Connect with verified plumbing and electrical professionals. Book in minutes, get it fixed today.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/book">
              <Button size="lg" className="bg-gray-900 px-8 font-medium hover:bg-gray-800">
                Book a service
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="font-medium">
                Learn more
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-y border-gray-200 bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm font-medium text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Verified professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Licensed & insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Same-day service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h3 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Our services
          </h3>
          <p className="text-lg text-gray-600">
            Expert help for your home, when you need it
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Plumbing Card */}
          <Link
            href="/services/plumbing"
            className="group rounded-xl border border-gray-200 bg-white p-8 transition-all hover:border-gray-300 hover:shadow-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200">
              <Wrench className="h-6 w-6 text-gray-900" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-gray-900">Plumbing</h3>
            <p className="mb-6 text-gray-600">
              Emergency repairs, installations, and maintenance for all your plumbing needs
            </p>
            <ul className="mb-6 space-y-2.5 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
                Emergency leak repair
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
                Drain cleaning & unclogging
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
                Water heater installation & repair
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
                Pipe repair & installation
              </li>
            </ul>
            <div className="text-sm font-medium text-gray-900 group-hover:underline">
              View plumbing services →
            </div>
          </Link>

          {/* Electrical Card */}
          <Link
            href="/services/electrical"
            className="group rounded-xl border border-gray-200 bg-white p-8 transition-all hover:border-gray-300 hover:shadow-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200">
              <Zap className="h-6 w-6 text-gray-900" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold text-gray-900">Electrical</h3>
            <p className="mb-6 text-gray-600">
              Safe, certified electrical work for outlets, panels, lighting, and more
            </p>
            <ul className="mb-6 space-y-2.5 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
                Outlet installation & repair
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
                Circuit breaker replacement
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
                Lighting installation
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
                Electrical panel upgrades
              </li>
            </ul>
            <div className="text-sm font-medium text-gray-900 group-hover:underline">
              View electrical services →
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-200 bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h3 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
              How it works
            </h3>
            <p className="text-lg text-gray-600">
              Get help in three simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-xl font-semibold text-white">
                1
              </div>
              <h4 className="mb-3 text-xl font-semibold text-gray-900">Choose your service</h4>
              <p className="text-gray-600">
                Select from plumbing or electrical services that match your needs
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-xl font-semibold text-white">
                2
              </div>
              <h4 className="mb-3 text-xl font-semibold text-gray-900">Book your time</h4>
              <p className="text-gray-600">
                Pick a time slot that works for you and describe your issue
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-xl font-semibold text-white">
                3
              </div>
              <h4 className="mb-3 text-xl font-semibold text-gray-900">Get it fixed</h4>
              <p className="text-gray-600">
                A verified professional arrives on time and completes the job
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="rounded-2xl border border-gray-200 bg-gray-900 px-8 py-16 text-center">
          <h3 className="mb-4 text-3xl font-bold text-white">
            Ready to get started?
          </h3>
          <p className="mb-8 text-lg text-gray-300">
            Book a professional today and get your home services handled fast
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-white px-8 font-medium text-gray-900 hover:bg-gray-100">
              Book now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                <span className="text-sm font-bold text-white">V</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Victor</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2026 Victor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
