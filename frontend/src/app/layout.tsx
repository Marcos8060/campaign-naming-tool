import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

// Deliberately not using next/font/google (Inter) — it downloads the font
// from Google's servers at *build* time, which has broken builds twice now
// in two different environments when that network call failed/timed out.
// Tailwind's default `font-sans` stack (ui-sans-serif/system-ui/-apple-
// system/Segoe UI/Roboto/...) looks close enough to Inter for our purposes
// and has zero external dependency — a build can never fail because of it.

export const metadata: Metadata = {
  title: 'Camparc',
  description: 'Multi-tenant campaign naming and intelligence platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
