import Link from 'next/link';

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Why Camparc', href: '#problem' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Features', href: '#features' },
      { label: 'API Docs', href: '/docs' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

const EXPORT_PLATFORMS = 'Google Ads, TikTok, DV360, LinkedIn';

export function LandingFooter() {
  return (
    <footer className="bg-navy-darker text-gray-400">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-extrabold text-white text-lg tracking-tight">Camparc</span>
            </Link>

            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-5">
              Campaign naming, deployment, and reporting across ad platforms — live on Meta today,
              built directly against Meta&apos;s official API, with more platforms on the way.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                Live on: <span className="font-bold text-white">Meta</span>
              </span>
              <span className="text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                Export-ready: <span className="font-bold text-white">{EXPORT_PLATFORMS}</span>
              </span>
            </div>
          </div>

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

        <div className="border-t border-gray-800 pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Camparc. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
