import { ArrowRight, Settings2, Rocket, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const STEPS = [
  {
    num: '01',
    icon: Settings2,
    badge: '10 minutes',
    title: 'Define your naming taxonomy once',
    body: 'Set the structure — brand, product, region, objective, audience — that your entire team will use across every platform. No more "how did we name this again?"',
    detail: 'Supports custom fields, hierarchy, and per-platform character limits.',
    color: `var(--color-primary)`,
    bg: 'bg-blue-50',
  },
  {
    num: '02',
    icon: Rocket,
    badge: 'Every campaign',
    title: 'Launch campaigns with enforced naming',
    body: 'Our 5-step wizard guides every campaign through your taxonomy rules and shows a live preview of the generated name. Compliance is automatic, not optional.',
    detail: 'Works across Meta, Google Ads, TikTok, DV360, and LinkedIn simultaneously.',
    color: '#6c5ce7',
    bg: 'bg-purple-50',
  },
  {
    num: '03',
    icon: BarChart3,
    badge: 'Always on',
    title: 'Detect waste. Optimize. Report.',
    body: 'Camparc continuously scans for audience overlaps, surfaces wasted budget, and delivers cross-channel analytics in one dashboard — ready to act on, not just admire.',
    detail: 'Client-ready CSV exports with one click. No spreadsheet stitching required.',
    color: '#00b894',
    bg: 'bg-emerald-50',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[#f8faff]">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary-soft border border-blue-100 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            How It Works
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            From chaos to clarity in three steps.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Camparc replaces months of painful Excel work with a system that enforces consistency automatically — before campaigns go live, not after.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          <div className="hidden lg:block absolute top-[52px] left-[calc(33.33%+32px)] right-[calc(33.33%+32px)] h-px bg-gradient-to-r from-[var(--color-primary)]/20 via-[#6c5ce7]/40 to-[#00b894]/20" />

          {STEPS.map(({ num, icon: Icon, badge, title, body, detail, color, bg }, i) => (
            <div key={num} className="relative flex flex-col">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0"
                style={{ backgroundColor: color + '18' }}
              >
                <Icon className="w-7 h-7" style={{ color }} />
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl font-extrabold tracking-tight" style={{ color: color + '30' }}>{num}</span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: color + '15', color }}
                >
                  {badge}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-gray-900 mb-3 leading-snug">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{body}</p>
              <p className="text-xs text-gray-400 italic">{detail}</p>

              {i < STEPS.length - 1 && (
                <div className="lg:hidden mt-6 flex justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Button
            href="/register"
            variant="text"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="px-8 py-4 primary-gradient text-white hover:text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20/60 text-sm"
          >
            Start Your 14-Day Free Trial
          </Button>
          <p className="text-xs text-gray-400 mt-3">No credit card. No sales call. Just results.</p>
        </div>

      </div>
    </section>
  );
}
