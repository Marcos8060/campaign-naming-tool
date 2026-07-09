import {
  Tag, BarChart3, Users, Target, Download, Palette,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

const FEATURES = [
  {
    icon: Tag,
    outcome: 'Save 10 hours a week on naming disputes',
    title: 'Standardize naming across all platforms',
    body: 'Define your taxonomy hierarchy once. Every campaign created through Camparc follows the same structure — no exceptions, no rogue naming.',
    color: `var(--color-primary)`,
    bg: 'bg-blue-50',
  },
  {
    icon: Target,
    outcome: 'Find $45K in duplicate spend this week',
    title: 'Detect audience overlap before it drains your budget',
    body: "Camparc maps which campaigns are targeting the same audiences across platforms and quantifies exactly how much that's costing you. Stop paying to compete against yourself.",
    color: '#e17055',
    bg: 'bg-red-50',
  },
  {
    icon: BarChart3,
    outcome: 'Replace 5 platform dashboards with one',
    title: 'Cross-channel performance in a single view',
    body: 'ROAS, spend, impressions, and conversions — across every ad platform — unified in one clean dashboard. No spreadsheet stitching. No data wrangling.',
    color: '#6c5ce7',
    bg: 'bg-purple-50',
  },
  {
    icon: Download,
    outcome: 'Generate client reports in 60 seconds',
    title: 'Platform-ready CSV exports on demand',
    body: 'Produce perfectly formatted, client-ready exports with one click. Upload directly to each platform without touching a spreadsheet.',
    color: '#00b894',
    bg: 'bg-emerald-50',
  },
  {
    icon: Users,
    outcome: 'Scale your agency without losing control',
    title: 'Role-based access for every team member',
    body: "Admins set the rules. Managers execute campaigns. Viewers read reports. Everyone sees exactly what they need — nothing more, nothing less.",
    color: '#fdcb6e',
    bg: 'bg-amber-50',
  },
  {
    icon: Palette,
    outcome: 'Deliver a premium client experience',
    title: 'White-label branding for agencies',
    body: "Upload your logo, set your brand colors, and deliver a fully branded workspace to every client. They'll think you built it.",
    color: '#fd79a8',
    bg: 'bg-pink-50',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary-soft border border-blue-100 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Features
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Built for agencies spending{' '}
            <span className="text-transparent bg-clip-text primary-gradient">real budgets.</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Every feature is measured by one metric: does it save you money, save you time, or make you look smarter in front of clients?
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, outcome, title, body, color, bg }) => (
            <Card
              key={title}
              variant="outlined"
              padding="lg"
              className="group relative hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-300"
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>

              {/* Outcome badge */}
              <div
                className="inline-block text-[10px] font-bold px-2 py-1 rounded-full mb-3"
                style={{ backgroundColor: color + '12', color }}
              >
                {outcome}
              </div>

              <h3 className="font-bold text-gray-900 mb-2 text-sm leading-snug">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{body}</p>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
