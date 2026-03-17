export default function BookingsLoading() {
  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="h-4 w-24 animate-pulse rounded bg-fog" />
        </div>
      </header>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-fog" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white p-6 shadow">
              <div className="mb-3 h-5 w-64 animate-pulse rounded bg-fog" />
              <div className="mb-2 h-4 w-40 animate-pulse rounded bg-fog" />
              <div className="h-4 w-32 animate-pulse rounded bg-fog" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
