'use client';

import { useEffect } from 'react';
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: wire this into an error-monitoring service (Sentry or similar)
    // once one's set up.
    console.error('Root layout error boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#f0f5ff',
          }}
        >
          <div style={{ maxWidth: '420px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#0f1c3f' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.6 }}>
              Camparc hit an unexpected error loading this page. Try again, or reload the page.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '10px 20px',
                background: '#0A54CA',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
