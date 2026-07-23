'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: wire this into an error-monitoring service (Sentry or similar)
    // once one's set up — for now this at least leaves a trace instead of
    // failing silently.
    console.error('Dashboard error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          This page hit an unexpected error. You can try again, or head back to your dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" href="/dashboard">
            Back to dashboard
          </Button>
          <Button variant="primary" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </Card>
    </div>
  );
}
