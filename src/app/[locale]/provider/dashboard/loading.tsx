export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-fog" />
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow">
            <div className="mb-3 h-4 w-24 animate-pulse rounded bg-fog" />
            <div className="h-8 w-16 animate-pulse rounded bg-fog" />
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow">
            <div className="mb-3 h-5 w-48 animate-pulse rounded bg-fog" />
            <div className="h-4 w-32 animate-pulse rounded bg-fog" />
          </div>
        ))}
      </div>
    </div>
  );
}
