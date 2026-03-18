export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-mist">
      <div className="container mx-auto max-w-2xl px-6 py-8">
        {/* Title */}
        <div className="mb-2 h-8 w-32 animate-pulse rounded bg-fog" />
        <div className="mb-8 h-4 w-56 animate-pulse rounded bg-fog" />

        {/* Profile card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="space-y-6">
            {/* Name field */}
            <div>
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-fog" />
              <div className="h-10 w-full animate-pulse rounded bg-fog" />
            </div>
            {/* Email field */}
            <div>
              <div className="mb-2 h-4 w-16 animate-pulse rounded bg-fog" />
              <div className="h-10 w-full animate-pulse rounded bg-fog" />
            </div>
            {/* Phone field */}
            <div>
              <div className="mb-2 h-4 w-16 animate-pulse rounded bg-fog" />
              <div className="h-10 w-full animate-pulse rounded bg-fog" />
            </div>
            {/* Address fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-2 h-4 w-20 animate-pulse rounded bg-fog" />
                <div className="h-10 w-full animate-pulse rounded bg-fog" />
              </div>
              <div>
                <div className="mb-2 h-4 w-16 animate-pulse rounded bg-fog" />
                <div className="h-10 w-full animate-pulse rounded bg-fog" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
