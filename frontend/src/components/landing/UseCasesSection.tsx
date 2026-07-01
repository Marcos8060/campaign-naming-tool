import Link from 'next/link';
import { ArrowRight, Building2, Briefcase, BarChart2 } from 'lucide-react';

const USE_CASES = [
  {
    icon: Building2,
    tag: 'D2C Brands',
    headline: 'Stop paying to compete against yourself across channels.',
    pain: 'You\'re running Meta, Google, and TikTok simultaneously. But no one has a clear view of audience overlap — so you\'re paying three platforms to reach the same 200K customers.',
    solution: 'Camparc maps the overlap in real time, shows you the exact dollar waste, and lets you reallocate budget to net-new audiences that actually expand your reach.',
    result: 'Typical outcome: 15–25% reduction in cost-per-acquisition within the first 30 days.',
    color: `var(--color-primary)`,
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: Briefcase,
    tag: 'Digital Agencies',
    headline: 'Scale to 50 clients without losing naming consistency.',
    pain: 'Every account manager has their own naming convention. When a client asks "why did performance drop?" you spend two days cleaning data before you can even start the analysis.',
    solution: 'Set your agency\'s taxonomy once. Every campaign for every client follows the same structure. Reporting that used to take days takes minutes. Clients get consistent, beautiful reports.',
    result: 'Typical outcome: 80% reduction in data cleanup time. 3× faster reporting cycles.',
    color: '#6c5ce7',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    icon: BarChart2,
    tag: 'Marketing Operations',
    headline: 'Stop spending 80% of your time cleaning data.',
    pain: 'Your job should be insights. Instead, you\'re in Excel every Monday morning reconciling five different naming formats before the weekly performance review.',
    solution: 'Camparc enforces consistency upstream — at campaign creation — so your data is always clean. Monday morning is now analysis time, not cleanup time.',
    result: 'Typical outcome: 20+ hours recovered per week. Attribution accuracy up by 40%.',
    color: '#00b894',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 bg-[#f8faff]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary-soft border border-blue-100 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Who It's For
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            If this sounds like your team,{' '}
            <span className="text-transparent bg-clip-text primary-gradient">you're in the right place.</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {USE_CASES.map(({ icon: Icon, tag, headline, pain, solution, result, color, bg, border }) => (
            <div key={tag} className={`bg-white rounded-2xl border ${border} overflow-hidden`}>
              {/* Top band */}
              <div className={`${bg} px-6 py-5 border-b ${border}`}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                    <Icon className="w-4.5 h-4.5" style={{ color }} />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color }}>
                    {tag}
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-900 text-base leading-snug">{headline}</h3>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">The Pain</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{pain}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">The Fix</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{solution}</p>
                </div>
                <div
                  className="text-xs font-semibold px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: color + '10', color }}
                >
                  📈 {result}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 primary-gradient text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20/60 text-sm"
          >
            See How It Works For Your Team <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
