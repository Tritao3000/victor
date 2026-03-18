export default function ProviderProfileLoading() {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Title */}
      <div className="mb-2 h-8 w-36 animate-pulse rounded bg-fog" />
      <div className="mb-8 h-4 w-64 animate-pulse rounded bg-fog" />

      {/* Profile sections */}
      <div className="space-y-6">
        {/* Basic info card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 h-5 w-36 animate-pulse rounded bg-fog" />
          <div className="space-y-4">
            <div>
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-fog" />
              <div className="h-10 w-full animate-pulse rounded bg-fog" />
            </div>
            <div>
              <div className="mb-2 h-4 w-12 animate-pulse rounded bg-fog" />
              <div className="h-20 w-full animate-pulse rounded bg-fog" />
            </div>
          </div>
        </div>

        {/* Service details card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-fog" />
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="h-8 w-24 animate-pulse rounded bg-fog" />
              <div className="h-8 w-24 animate-pulse rounded bg-fog" />
            </div>
            <div>
              <div className="mb-2 h-4 w-28 animate-pulse rounded bg-fog" />
              <div className="h-10 w-full animate-pulse rounded bg-fog" />
            </div>
          </div>
        </div>

        {/* Verification card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 h-5 w-36 animate-pulse rounded bg-fog" />
          <div className="h-4 w-48 animate-pulse rounded bg-fog" />
        </div>
      </div>
    </div>
  );
}
