export default function BookLoading() {
  return (
    <main className="min-h-screen bg-mist">
      <div className="container mx-auto max-w-2xl px-6 py-8">
        {/* Title */}
        <div className="mb-2 h-8 w-48 animate-pulse rounded bg-fog" />
        <div className="mb-8 h-4 w-72 animate-pulse rounded bg-fog" />

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-8 animate-pulse rounded-full bg-fog" />
          ))}
        </div>

        {/* Service cards */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg bg-white p-6 shadow">
              <div className="mb-3 h-5 w-40 animate-pulse rounded bg-fog" />
              <div className="mb-2 h-4 w-64 animate-pulse rounded bg-fog" />
              <div className="h-4 w-24 animate-pulse rounded bg-fog" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
