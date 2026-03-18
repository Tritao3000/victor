export default function BookingDetailLoading() {
  return (
    <main className="min-h-screen bg-mist">
      <div className="container mx-auto max-w-3xl px-6 py-8">
        {/* Back link */}
        <div className="mb-6 h-4 w-32 animate-pulse rounded bg-fog" />

        {/* Status + title */}
        <div className="mb-2 h-6 w-24 animate-pulse rounded-full bg-fog" />
        <div className="mb-8 h-8 w-64 animate-pulse rounded bg-fog" />

        {/* Details cards */}
        <div className="space-y-6">
          {/* Provider card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 h-5 w-36 animate-pulse rounded bg-fog" />
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-fog" />
              <div>
                <div className="mb-2 h-5 w-32 animate-pulse rounded bg-fog" />
                <div className="h-4 w-24 animate-pulse rounded bg-fog" />
              </div>
            </div>
          </div>

          {/* Booking details card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 h-5 w-32 animate-pulse rounded bg-fog" />
            <div className="space-y-3">
              <div className="h-4 w-48 animate-pulse rounded bg-fog" />
              <div className="h-4 w-56 animate-pulse rounded bg-fog" />
              <div className="h-4 w-40 animate-pulse rounded bg-fog" />
            </div>
          </div>

          {/* Price card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 h-5 w-16 animate-pulse rounded bg-fog" />
            <div className="h-8 w-24 animate-pulse rounded bg-fog" />
          </div>
        </div>
      </div>
    </main>
  );
}
