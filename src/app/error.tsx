'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-6">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-charcoal">Something went wrong</h1>
        <p className="mb-6 text-slate">An unexpected error occurred. Please try again.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
