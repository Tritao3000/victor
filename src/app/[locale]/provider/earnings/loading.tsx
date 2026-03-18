export default function EarningsLoading() {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Title */}
      <div className="mb-2 h-8 w-28 animate-pulse rounded bg-fog" />
      <div className="mb-8 h-4 w-56 animate-pulse rounded bg-fog" />

      {/* Stats cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow">
            <div className="mb-3 h-4 w-24 animate-pulse rounded bg-fog" />
            <div className="h-8 w-20 animate-pulse rounded bg-fog" />
          </div>
        ))}
      </div>

      {/* Job history table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 h-5 w-28 animate-pulse rounded bg-fog" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-fog pb-3">
              <div className="h-4 w-20 animate-pulse rounded bg-fog" />
              <div className="h-4 w-32 animate-pulse rounded bg-fog" />
              <div className="h-4 w-24 animate-pulse rounded bg-fog" />
              <div className="ml-auto h-4 w-16 animate-pulse rounded bg-fog" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
