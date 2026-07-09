import { Quote } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const METRICS = [
  { value: '$353B', label: 'wasted globally in ad spend annually', sub: 'Source: Forrester Research, 2024' },
  { value: '35%', label: 'of ad budgets lost to audience overlap', sub: 'Industry average across channels' },
  { value: '80%', label: 'of analyst time spent on manual cleanup', sub: 'State of Marketing Ops, 2024' },
  { value: '10min', label: 'average time to fully configure Camparc', sub: 'Based on beta customer data' },
];

const TESTIMONIALS = [
  {
    quote: 'The audience overlap detection surfaced $40K in wasted spend in the first week. This tool pays for itself every single month — it\'s not even close.',
    name: 'Marcus Chen',
    role: 'Performance Director',
    company: 'Growth Labs Agency',
    initials: 'MC',
    color: `var(--color-primary)`,
  },
  {
    quote: 'We white-labeled it for three of our biggest clients. They think we built it in-house. Our retention improved because clients see more value from our service.',
    name: 'Priya Nair',
    role: 'Co-Founder',
    company: 'Verve Media Group',
    initials: 'PN',
    color: '#6c5ce7',
  },
  {
    quote: 'Campaign naming errors went to zero. The taxonomy wizard saved our team hours every week. Reporting that took 2 days now takes 20 minutes.',
    name: 'Sarah Mitchell',
    role: 'Head of Paid Media',
    company: 'Apex Digital',
    initials: 'SM',
    color: '#00b894',
  },
];

const TRUST_BADGES = [
  { label: 'Data encrypted at rest & in transit', icon: '🔒' },
  { label: 'Self-host option available', icon: '🏠' },
  { label: 'Open-source core', icon: '🔓' },
  { label: 'No vendor lock-in — export everything', icon: '📦' },
  { label: 'GDPR-ready architecture', icon: '🇪🇺' },
];

export function SocialProofSection() {
  return (
    <section className="py-20 bg-[#f8faff]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Stats banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {METRICS.map(({ value, label, sub }) => (
            <Card key={label} variant="outlined" padding="md" className="shadow-sm text-center">
              <p className="text-4xl font-extrabold tracking-tight mb-1" style={{ color: `var(--color-primary)` }}>{value}</p>
              <p className="text-xs font-semibold text-gray-700 mb-1 leading-snug">{label}</p>
              <p className="text-[10px] text-gray-400">{sub}</p>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Teams that stopped wasting budget.
          </h2>
          <p className="text-gray-500 text-sm">Early adopters who standardized their operations with Camparc.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {TESTIMONIALS.map(({ quote, name, role, company, initials, color }) => (
            <Card key={name} variant="outlined" padding="lg" className="shadow-sm flex flex-col">
              <Quote className="w-6 h-6 mb-4 flex-shrink-0" style={{ color: color + '60' }} />
              <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-5 italic">"{quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{role}, {company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust badges */}
        <Card variant="outlined" padding="lg">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Security & Trust</p>
          <div className="flex flex-wrap justify-center gap-4">
            {TRUST_BADGES.map(({ label, icon }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <span className="text-base">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </Card>

      </div>
    </section>
  );
}
