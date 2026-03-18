'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main className="flex min-h-screen items-center justify-center bg-mist px-6">
          <div className="text-center">
            <div className="mb-6 text-5xl font-bold text-navy">!</div>
            <h1 className="mb-2 text-2xl font-bold text-charcoal">
              Something went wrong
            </h1>
            <p className="mb-6 text-slate">
              An unexpected error occurred. Please try again.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-light"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-fog px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-fog"
              >
                Back to home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
