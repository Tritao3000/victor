import Link from 'next/link';
import { Wrench, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-indigo-600">Victor</h1>
          <nav className="flex items-center gap-4">
            <Link href="/profile" className="text-sm text-gray-600 hover:text-indigo-600">
              Profile
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="mb-4 text-5xl font-bold text-gray-900">
            Home Services, On Demand
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Connect with verified plumbing and electrical professionals in minutes
          </p>
        </div>

        {/* Service Categories */}
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Plumbing Card */}
          <Link
            href="/services/plumbing"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl"
          >
            <div className="flex items-start space-x-6">
              <div className="rounded-xl bg-blue-100 p-4 transition-colors group-hover:bg-blue-200">
                <Wrench className="h-10 w-10 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">Plumbing</h3>
                <p className="mb-4 text-gray-600">
                  Leaks, drains, installations, and emergency repairs
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>• Emergency leak repair</li>
                  <li>• Drain cleaning</li>
                  <li>• Water heater installation</li>
                  <li>• Pipe repair & installation</li>
                </ul>
                <div className="mt-4 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                  Browse plumbing services →
                </div>
              </div>
            </div>
          </Link>

          {/* Electrical Card */}
          <Link
            href="/services/electrical"
            className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl"
          >
            <div className="flex items-start space-x-6">
              <div className="rounded-xl bg-yellow-100 p-4 transition-colors group-hover:bg-yellow-200">
                <Zap className="h-10 w-10 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">Electrical</h3>
                <p className="mb-4 text-gray-600">
                  Outlets, panels, lighting, and circuit repairs
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>• Outlet installation</li>
                  <li>• Circuit breaker repair</li>
                  <li>• Lighting installation</li>
                  <li>• Panel upgrades</li>
                </ul>
                <div className="mt-4 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                  Browse electrical services →
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-white py-16">
        <div className="container mx-auto px-6">
          <h3 className="mb-12 text-center text-3xl font-bold text-gray-900">
            How It Works
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
                1
              </div>
              <h4 className="mb-2 text-xl font-semibold text-gray-900">Choose Service</h4>
              <p className="text-gray-600">
                Browse plumbing and electrical services that fit your needs
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
                2
              </div>
              <h4 className="mb-2 text-xl font-semibold text-gray-900">Book Appointment</h4>
              <p className="text-gray-600">
                Select your preferred time and describe your issue
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
                3
              </div>
              <h4 className="mb-2 text-xl font-semibold text-gray-900">Get It Fixed</h4>
              <p className="text-gray-600">
                Verified professionals arrive on time and get the job done
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
