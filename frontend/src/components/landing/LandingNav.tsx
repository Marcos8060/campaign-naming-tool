import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NAV_LINKS = ['Features', 'How It Works', 'Pricing', 'Compare'];

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl primary-gradient flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-gray-900 text-lg tracking-tight">Camparc</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              {l}
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
            Try Free
          </Button>
        </div>
      </div>
    </nav>
  );
}
