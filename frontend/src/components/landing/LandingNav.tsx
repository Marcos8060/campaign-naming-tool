import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Why Camparc', href: '#problem' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
];

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="font-extrabold text-gray-900 text-lg tracking-tight">Camparc</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            href="/login"
            variant="text"
            className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Button>
          <Button
            href="/register"
            variant="text"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            className="text-sm font-bold text-white hover:text-white px-4 py-2 rounded-lg primary-gradient hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}
