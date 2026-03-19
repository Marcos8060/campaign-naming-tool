import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Compare', href: '#compare' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Use Cases',
    links: [
      { label: 'D2C Brands', href: '#' },
      { label: 'Digital Agencies', href: '#' },
      { label: 'Marketing Ops', href: '#' },
      { label: 'Enterprise', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy Policy', href: '#' },
    ],
  },
];

const PLATFORMS = ['Meta', 'Google Ads', 'TikTok', 'DV360', 'LinkedIn'];

export function LandingFooter() {
  return (
    <footer className="bg-[#080f1f] text-gray-400">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">Camparc</span>
            </Link>

            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-5">
              The open-source campaign intelligence platform built for marketing teams that are serious about their ad spend.
            </p>

            {/* Platform pills */}
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <span key={p} className="text-[10px] font-semibold text-gray-600 bg-gray-800 px-2 py-1 rounded">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Nav links */}
          {FOOTER_LINKS.map(({ title, links }) => (
            <div key={title}>
              <p className="text-white font-bold text-sm mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Camparc. All rights reserved. Built for the teams who hate wasting budget.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
              <a key={l} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
